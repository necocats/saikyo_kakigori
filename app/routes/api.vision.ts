// Cloud Vision API のサーバーサイドプロキシ。
//
// 以前はブラウザから直接 Vision API を叩いていたが、Vite の `VITE_*` は
// ビルド時にクライアントのJSへ文字列として埋め込まれるため、APIキーが
// 公開バンドルから誰でも読み取れる状態になっていた。
// このルートを経由させることで、キーはサーバー上の環境変数に留まり、
// ブラウザには一切渡らない。
import type { ActionFunctionArgs } from "react-router";

// base64化した画像のサイズ上限。Vercelのリクエストボディ上限(4.5MB)に
// 到達する前に弾く。
const MAX_IMAGE_CHARS = 3_000_000;

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return errorResponse("Method Not Allowed", 405);
  }

  // キーを隠した代わりに、このエンドポイント自体が誰でも使える
  // Vision APIの踏み台になりうる。同一オリジンからの呼び出しに限定して
  // 他サイトからの悪用を防ぐ。
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return errorResponse("Forbidden", 403);
  }

  const apiKey = process.env.VISION_API_KEY;
  if (!apiKey) {
    console.error("VISION_API_KEY が設定されていません");
    return errorResponse("Vision API is not configured", 500);
  }

  let image: unknown;
  try {
    ({ image } = (await request.json()) as { image?: unknown });
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (typeof image !== "string" || image.length === 0) {
    return errorResponse("image is required", 400);
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return errorResponse("image is too large", 413);
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: image },
              features: [{ type: "TEXT_DETECTION" }],
            },
          ],
        }),
      },
    );
  } catch (e) {
    console.error("Vision APIへの接続に失敗", e);
    return errorResponse("Cloud Vision API request failed", 502);
  }

  const payload = await upstream.text();

  if (!upstream.ok) {
    // 原因切り分けのためGoogleのエラー文言は残すが、
    // 万一キーが含まれていても漏れないよう除去する。
    console.error("Vision APIがエラーを返しました", upstream.status, payload);
    const reason = payload.split(apiKey).join("***");
    return Response.json(
      { error: "Cloud Vision API request failed", reason },
      { status: upstream.status },
    );
  }

  // 成功時はGoogleのレスポンスをそのまま返す。
  // 呼び出し側(OrderForm)の解析ロジックを変更せずに済む。
  return new Response(payload, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
