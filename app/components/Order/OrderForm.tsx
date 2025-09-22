import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchMenu, createOrder, type MenuItem } from "../../api/client";
import Placeholder from "../Placeholder";
import ErrorCard from "../ErrorCard";
import RecaptchaDialog from "../Recaptcha/Dialog";
import React from "react";

const API_KEY = import.meta.env.VITE_VISION_API_KEY;

export function OrderForm() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [visionErr, setVisionErr] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [handwritingScore, setHandwritingScore] = useState<number | null>(null);
  const [handwritingErr, setHandwritingErr] = useState<string | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const items = await fetchMenu(storeId);
        setMenu(items);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageSrc(base64String);
        handleImage(base64String);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleImage = async (base64Image: string | null) => {
    if (!base64Image) return;
    setVisionErr(null);
    setSelected("");
    setRecognizedText(null);
    setHandwritingScore(null);
    setHandwritingErr(null);

    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image.split(",")[1],
                },
                features: [
                  {
                    type: "TEXT_DETECTION",
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Cloud Vision API request failed");
      }

      const data = await response.json();
      let text = "";
      if (
        Array.isArray(data.responses) &&
        data.responses.length > 0 &&
        data.responses[0].fullTextAnnotation &&
        typeof data.responses[0].fullTextAnnotation.text === "string"
      ) {
        text = data.responses[0].fullTextAnnotation.text.replace(/\s/g, "");
        setRecognizedText(text);
      } else {
        setVisionErr("文字認識結果が取得できませんでした。");
        return;
      }

      // --- boundingBox の揺らぎをチェック ---
      const words: any[] =
        data.responses[0].fullTextAnnotation.pages?.flatMap((p: any) =>
          p.blocks.flatMap((b: any) =>
            b.paragraphs.flatMap((par: any) => par.words)
          )
        ) ?? [];

      if (words.length > 1) {
        const heights = words.map((w) => {
          const ys = w.boundingBox.vertices.map((v: any) => v.y);
          return Math.max(...ys) - Math.min(...ys);
        });

        const widths = words.map((w) => {
          const xs = w.boundingBox.vertices.map((v: any) => v.x);
          return Math.max(...xs) - Math.min(...xs);
        });

        const ratios = widths.map((w, i) => w / heights[i]);
        const baselines = words.map((w) =>
          Math.max(...w.boundingBox.vertices.map((v: any) => v.y))
        );

        // 平均と標準偏差を計算
        const avg = (arr: number[]) =>
          arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = (arr: number[]) => {
          const m = avg(arr);
          return Math.sqrt(
            arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length
          );
        };

        // Weight coefficients for the scoring algorithm
        const HEIGHT_WEIGHT = 0.4;
        const RATIO_WEIGHT = 0.3;
        const BASELINE_WEIGHT = 0.3;

        const score =
          std(heights) * HEIGHT_WEIGHT +
          std(ratios) * RATIO_WEIGHT +
          std(baselines) * BASELINE_WEIGHT;

        setHandwritingScore(score);

        if (score < 2.0) {
          // 揺らぎが小さい → フォントっぽい
          setHandwritingErr("文字にあたたかみがありません。手書きしてください");
          return;
        }
      }

      // --- メニュー判定 ---
      const matchedMenu = menu.find((item) =>
        text.includes(item.name.replace(/\s/g, ""))
      );

      if (matchedMenu) {
        setSelected(matchedMenu.id);
      } else {
        setVisionErr("そんなメニューはありません。");
      }
    } catch (error) {
      console.error("Error calling the Vision API", error);
      setVisionErr("文字認識に失敗しました");
    }
  };

  const handleOrder = async () => {
    if (!storeId || !selected) return;
    setShowRecaptcha(true); // まずモーダルを表示
  };

  const handleRecaptchaConfirm = async () => {
    setShowRecaptcha(false);
    setSubmitting(true);
    setErr(null);
    try {
      const data = await createOrder(storeId!, selected);
      navigate(`/order/${storeId}/receipt/${data.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
      setRecaptchaChecked(false);
    }
  };

  return (
    <>
      <div className="mt-6">
        <h2 className="text-center text-xl font-semibold">MENU</h2>
        <ul>
          {menu.map((item, index) => (
            <li
              key={item.id}
              className={`
                p-3.5
                transition
                ${index < menu.length - 1 ? "border-b" : ""}
              `}
            >
              <span className="text-black dark:text-white">{item.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
        注文したいメニューを文字で紙に記入してください。
      </p>

      {loading ? (
        <Placeholder />
      ) : err ? (
        <ErrorCard title="通信に失敗しました" message={err} />
      ) : (
        <div className="mt-6 space-y-4">
          <>
            <div>
              <label
                htmlFor="file-upload"
                className="w-full block text-center cursor-pointer rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
              >
                画像をアップロード
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </>

          {imageSrc && (
            <div className="mt-4">
              <img
                src={imageSrc}
                alt="Uploaded"
                className="w-full rounded-2xl"
              />
            </div>
          )}

          {recognizedText && (
            <p className="text-center mt-2">
              「{recognizedText}」が読み込まれました
            </p>
          )}

          {/* スコア表示 */}
          {/* {handwritingScore !== null && (
            <p className="text-center mt-2">
              手書きスコア: {handwritingScore.toFixed(2)}
            </p>
          )} */}

          {visionErr && (
            <p className="text-red-500 text-center mt-2">{visionErr}</p>
          )}

          {handwritingErr && (
            <p className="text-red-500 text-center mt-2">{handwritingErr}</p>
          )}

          {selected && (
            <p className="text-green-500 text-center mt-2">
              「{menu.find((item) => item.id === selected)?.name}
              」が選択されました
            </p>
          )}

          <button
            type="button"
            onClick={handleOrder}
            disabled={!selected || submitting}
            className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "送信中..." : "この内容で注文する"}
          </button>

          {/* Recaptcha風モーダル（オセロ） */}
          <RecaptchaDialog
            open={showRecaptcha}
            onClose={() => setShowRecaptcha(false)}
            onSuccess={handleRecaptchaConfirm}
          />
        </div>
      )}
    </>
  );
}
