import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { fetchMenu, createOrder, type MenuItem } from "../api/client";
import Placeholder from "../components/Placeholder";
import ErrorCard from "../components/ErrorCard";

const questions = [
  {
    question: "氷の量はどうしますか？",
    choices: ["普通", "少なめ", "多め"],
  },
  {
    question: "甘さはどうしますか？",
    choices: ["普通", "甘さ控えめ", "すごく甘く"],
  },
  {
    question: "トッピングを追加しますか？",
    choices: ["しない", "練乳", "あずき"],
  },
];

export default function OrderPage() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [agreedToQuestionnaire, setAgreedToQuestionnaire] = useState(false);
  const [questionnaireStep, setQuestionnaireStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number | null>(
    null,
  );

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

  // 店舗IDをパス引数から取得してメニューを取得
  useEffect(() => {
    if (!storeId || questionnaireStep < questions.length) return;
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
  }, [storeId, questionnaireStep]);

  // 送信ボタンクリックで注文の送信
  const handleOrder = async () => {
    if (!storeId || !selected) return;
    setSubmitting(true);
    setErr(null);
    try {
      const data = await createOrder(storeId, selected);
      // 注文IDを受け取ったら完了画面に遷移
      navigate(`/order/${storeId}/receipt/${data.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      setAnswers([...answers, selectedAnswer]);
      setSelectedAnswer("");
      setQuestionnaireStep(questionnaireStep + 1);
    }
  };

  const handleRetry = () => {
    setAgreedToQuestionnaire(false);
    setQuestionnaireStep(0);
    setAnswers([]);
    setSelectedAnswer("");
  };

  const handleDpad = (direction: "up" | "down" | "right") => {
    if (direction === "right") {
      setAgreedToQuestionnaire(true);
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
      agreementButtons[selectedButtonIndex].action(setAgreedToQuestionnaire);
    }
  };

  const handleBButton = () => {
    setSelectedButtonIndex(null);
  };

  const currentQuestion = questions[questionnaireStep];

  return (
    <main className="mx-auto max-w-sm p-4 min-h-[100dvh] flex flex-col justify-start">
      <h1 className="text-2xl font-bold text-center">かき氷注文システム</h1>
      {!agreedToQuestionnaire ? (
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
        </div>
      ) : questionnaireStep < questions.length ? (
        <>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            {currentQuestion.question}
          </p>
          <div className="mt-6 space-y-4">
            <fieldset className="space-y-3">
              {currentQuestion.choices.map((choice) => (
                <label
                  key={choice}
                  className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition active:scale-[0.99] ${
                    selectedAnswer === choice
                      ? "border-blue-600 ring-2 ring-blue-600/20"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="choice"
                    className="mt-1 h-5 w-5 accent-blue-600"
                    checked={selectedAnswer === choice}
                    onChange={() => setSelectedAnswer(choice)}
                  />
                  <div className="flex-1">{choice}</div>
                </label>
              ))}
            </fieldset>
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              決定
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
            >
              やり直す
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            味を選んで注文してください
          </p>

          {loading ? (
            <Placeholder />
          ) : err ? (
            <ErrorCard title="通信に失敗しました" message={err} />
          ) : (
            <div className="mt-6 space-y-4">
              <fieldset className="space-y-3">
                {menu.length === 0 ? (
                  <p className="text-center text-gray-500">
                    メニューがありません
                  </p>
                ) : (
                  menu.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition active:scale-[0.99] ${
                        selected === item.id
                          ? "border-blue-600 ring-2 ring-blue-600/20"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="menu"
                        className="mt-1 h-5 w-5 accent-blue-600"
                        checked={selected === item.id}
                        onChange={() => setSelected(item.id)}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </fieldset>

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
      )}
      {!agreedToQuestionnaire && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-4 flex justify-center items-center gap-16 w-full max-w-sm bg-white dark:bg-gray-800">
          <div className="grid grid-cols-3 gap-1 w-24">
            <div />
            <button
              type="button"
              onClick={() => handleDpad("up")}
              className="bg-gray-300 dark:bg-gray-700 rounded-md p-2"
            >
              ▲
            </button>
            <div />
            <button
              type="button"
              className="bg-gray-300 dark:bg-gray-700 rounded-md p-2"
            >
              ◀
            </button>
            <div />
            <button
              type="button"
              onClick={() => handleDpad("right")}
              className="bg-gray-300 dark:bg-gray-700 rounded-md p-2"
            >
              ▶
            </button>
            <div />
            <button
              type="button"
              onClick={() => handleDpad("down")}
              className="bg-gray-300 dark:bg-gray-700 rounded-md p-2"
            >
              ▼
            </button>
            <div />
          </div>
          <div className="grid grid-cols-3 gap-1 w-24 relative h-30">
            <div className="col-start-2 row-start-1 flex justify-center items-center">
              <button
                type="button"
                className="bg-gray-300 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center"
              >
                X
              </button>
            </div>
            <div className="col-start-1 row-start-2 flex justify-center items-center">
              <button
                type="button"
                className="bg-gray-300 dark:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center"
              >
                Y
              </button>
            </div>
            <div className="col-start-3 row-start-2 flex justify-center items-center">
              <button
                type="button"
                onClick={handleAButton}
                className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                A
              </button>
            </div>
            <div className="col-start-2 row-start-3 flex justify-center items-center">
              <button
                type="button"
                onClick={handleBButton}
                className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                B
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
