import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Webcam from "react-webcam";
import { fetchMenu, createOrder, type MenuItem } from "../api/client";
import Placeholder from "./Placeholder";
import ErrorCard from "./ErrorCard";

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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);

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

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
      setIsCameraOpen(false);
      handleImage(image);
    }
  }, [webcamRef]);

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
      const text =
        data.responses[0]?.fullTextAnnotation?.text.replace(/\s/g, "") ?? "";
      setRecognizedText(text);

      const matchedMenu = menu.find((item) =>
        text.includes(item.name.replace(/\s/g, ""))
      );

      if (matchedMenu) {
        setSelected(matchedMenu.id);
      } else {
        setVisionErr(
          "そんなメニューはありません。もう一度読み込みなおしです。"
        );
      }
    } catch (error) {
      console.error("Error calling the Vision API", error);
      setVisionErr("文字認識に失敗しました");
    }
  };

  const handleOrder = async () => {
    if (!storeId || !selected) return;
    setSubmitting(true);
    setErr(null);
    try {
      const data = await createOrder(storeId, selected);
      navigate(`/order/${storeId}/receipt/${data.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mt-6">
        <h2 className="text-center text-xl font-semibold">メニュー</h2>
        <ul className="list-disc list-inside">
          {menu.map((item) => (
            <li key={item.id}>{item.name}</li>
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
          {isCameraOpen ? (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-2xl"
              />
              <button
                type="button"
                onClick={handleCapture}
                className="w-full mt-2 rounded-2xl bg-green-500 text-white py-3 font-semibold"
              >
                撮影
              </button>
              <button
                type="button"
                onClick={() => setIsCameraOpen(false)}
                className="w-full mt-2 rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
              >
                カメラを起動
              </button>
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
          )}

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

          {visionErr && (
            <p className="text-red-500 text-center mt-2">{visionErr}</p>
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
        </div>
      )}
    </>
  );
}
