// アンケート同意画面
import { useState } from "react";
import { Controller } from "./Controller";

const agreementButtons = [
  {
    text: "同意",
    action: () => {
      alert("同意してくれてありがとう！");
    },
    className: "bg-blue-600 text-white",
  },
  {
    text: "どちらかといえば同意",
    action: () =>
      alert("ちょっとだけ垣間見える反骨精神みたいなの捨てた方がいいですよ。"),
    className: "bg-blue-400 text-white",
  },
  {
    text: "どちらかといえば同意しない",
    action: () => alert("もっとしっかり自分の意見を持った方がいいですよ"),
    className: "bg-blue-200 text-black",
  },
  {
    text: "同意しない",
    action: () => alert("逆張りはかっこわるいですよ"),
    className: "border border-gray-300 dark:border-gray-700",
  },
];

export function Agreement({ onAgree }: { onAgree: () => void }) {
  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number | null>(
    null,
  );

  const handleDpad = (direction: "up" | "down" | "right") => {
    if (direction === "right") {
      onAgree();
      return;
    }

    if (selectedButtonIndex === null) {
      setSelectedButtonIndex(0);
      return;
    }
    if (direction === "up") {
      setSelectedButtonIndex(
        (selectedButtonIndex - 1 + agreementButtons.length) %
          agreementButtons.length,
      );
    } else {
      setSelectedButtonIndex(
        (selectedButtonIndex + 1) % agreementButtons.length,
      );
    }
  };

  const handleAButton = () => {
    if (selectedButtonIndex !== null) {
      agreementButtons[selectedButtonIndex].action();
    }
  };

  const handleBButton = () => {
    setSelectedButtonIndex(null);
  };

  return (
    <div className="mt-6 text-center">
      <p className="text-gray-600 dark:text-gray-300">
        まずは簡単なアンケートにお答えください
      </p>
      {agreementButtons.map((button, index) => (
        <button
          key={button.text}
          type="button"
          className={`mt-2 w-full rounded-2xl py-3 font-semibold pointer-events-none ${
            button.className
          } ${
            selectedButtonIndex === index
              ? "ring-2 ring-offset-2 ring-red-500"
              : ""
          }`}
        >
          {button.text}
        </button>
      ))}
      <Controller
        onDpad={handleDpad}
        onAButton={handleAButton}
        onBButton={handleBButton}
      />
    </div>
  );
}
