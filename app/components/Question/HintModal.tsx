// ヒントモーダル
import { useState } from "react";

export function HintModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [isModalEnlarged, setIsModalEnlarged] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center ">
      <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg relative transition-all ${
          isModalEnlarged ? "w-full h-full" : "w-11/12 max-w-sm"
        }`}
      >
        <button
          onClick={() => setIsModalEnlarged(!isModalEnlarged)}
          className="absolute top-2 right-2 text-gray-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
        <p className="text-center">"なつご"おりの日だから・・・</p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            へい
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            わかりました
          </button>
        </div>
      </div>
    </div>
  );
}
