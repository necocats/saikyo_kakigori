import { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router";
import { fetchOrderById, type OrderResponse } from "../api/client";
import ErrorCard from "../components/ErrorCard";
import SuccessCard from "../components/SuccessCard";
import "../css/TextModal.css";

const TrickyModal = ({ onClose }: { onClose: () => void }) => {
  const textPart1 =
    "1. 縦にスプーンを入れる。横からすくうのではなく、上から縦にスプーンを入れることで味のコントラストを楽しめます。";
  const textPart2 =
    " 2. 段階的に味わう。まず上から順番にトッピング（小豆など）とシロップの組み合わせを楽しむ真ん中の氷のみの部分では、天然氷本来の味わいを堪能する最後に追加シロップをかけてフィナーレを迎える";
  const textPart3 =
    "急いで食べる必要はなく、時間をかけて味わうことでかき氷の魅力をより堪能できるとしています。";
  const textPart4 =
    "この食べ方は、goodie foodieの「かき氷の食べ方｜夏の定番スイーツの計算し尽くされた味を最後まで楽しむには？」という記事を要約したものです";
  const textPart5 =
    "もうちょっと長い文章にしたかったなあまあ何回か繰り返して表示させればいいやてきとうになんか書いとけ";
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>おいしいかき氷の食べ方</h2>
        <div className="modal-body">
          {Array.from({ length: 20 }).map((_, index) => (
            <p key={index}>
              {textPart1}
              {textPart2}
              <span className="close-keyword" onClick={onClose}>
                食べ方がわかったらここをタップ
              </span>
              {textPart3}
              {textPart4}
              {textPart5}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ReceiptPage() {
  const { storeId, orderId } = useParams<{
    storeId: string;
    orderId: string;
  }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!storeId || !orderId) {
      setErr("URLが不正です");
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const data = await fetchOrderById(storeId, orderId);
        setOrder(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [storeId, orderId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (err) {
    return (
      <main className="mx-auto max-w-sm p-4">
        <ErrorCard title="注文を取得できませんでした" message={err} />
        <a
          href={`/order/${storeId}`}
          className="mt-4 block text-center w-full rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
        >
          注文画面に戻る
        </a>
      </main>
    );
  }

  return (
    <Fragment>
      <main className="mx-auto max-w-sm p-4">
        <h1 className="text-2xl font-bold text-center">注文完了</h1>
        {loading ? (
          <div className="mt-6 flex items-center justify-center py-10">
            <span
              aria-hidden="true"
              className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"
            />
            <output className="sr-only">読み込み中</output>
          </div>
        ) : (
          <>
            {order && <SuccessCard order={order} />}
            <a
              href={`/order/${storeId}`}
              className="mt-4 block text-center w-full rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
            >
              もう一度注文する
            </a>
          </>
        )}
      </main>

      {isModalOpen && <TrickyModal onClose={() => setIsModalOpen(false)} />}
    </Fragment>
  );
}
