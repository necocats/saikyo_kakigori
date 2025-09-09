import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { fetchMenu, createOrder, type MenuItem } from "../api/client";
import Placeholder from "../components/Placeholder";
import ErrorCard from "../components/ErrorCard";

const questions = [
  {
    question: "かき氷について詳しくなりたいですか？",
    choices: ["はい", "いいえ"],
    type: "choice",
  },
  {
    question:
      "かき氷は平安時代の随筆である枕草子の作中にも登場しています。さて、枕草子の作者は誰？",
    choices: [],
    type: "text",
  },
  {
    question: "かき氷の日は何月何日？",
    choices: [],
    type: "date_increment",
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
    null
  );
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalEnlarged, setIsModalEnlarged] = useState(false);

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
    const answerToSave =
      questionnaireStep === 2 ? `${month}月${day}日` : selectedAnswer;
    if (answerToSave) {
      setAnswers([...answers, answerToSave]);
      setSelectedAnswer("");
      setQuestionnaireStep(questionnaireStep + 1);
    }
  };

  const handleSubmitAnswer = () => {
    if (questionnaireStep === 1) {
      if (!selectedAnswer) return;
      if (selectedAnswer === "清少納言") {
        alert("正解です！");
        handleNextQuestion();
      } else if (selectedAnswer === "清原諾子") {
        alert("なんだと・・・");
        setAnswers([...answers, selectedAnswer]);
        setQuestionnaireStep(questions.length);
      } else {
        alert(
          "残念ですが不正解です。検索して調べてみましょう。ちなみに最初からやり直しだよ"
        );
        handleRetry();
      }
    } else if (questionnaireStep === 2) {
      if (month === 7 && day === 25) {
        alert("正解です！");
        handleNextQuestion();
      } else {
        alert("わかってないじゃん・・・嘘つかないでよ");
        handleRetry();
      }
    } else {
      if (!selectedAnswer) return;
      handleNextQuestion();
    }
  };

  const handleRetry = () => {
    setAgreedToQuestionnaire(false);
    setQuestionnaireStep(0);
    setAnswers([]);
    setSelectedAnswer("");
    setMonth(1);
    setDay(1);
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
          agreementButtons.length
      );
    } else {
      setSelectedButtonIndex(
        (selectedButtonIndex + 1) % agreementButtons.length
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

  const handlePickClick = () => {
    if (selectedAnswer === "はい") {
      handleNextQuestion();
    } else if (selectedAnswer === "いいえ") {
      alert("精神的に向上心の無いものはばかだ。");
      handleRetry();
    }
  };

  const currentQuestion = questions[questionnaireStep];
  const isDateOver = month > 7 || day > 25;

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
        <div className="relative flex-grow">
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            {currentQuestion.question}
          </p>
          <div className="mt-6 space-y-4">
            {currentQuestion.type === "choice" && (
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
            )}
            {currentQuestion.type === "text" && (
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
              />
            )}
            {currentQuestion.type === "date_increment" && (
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-2xl">
                  <span className="text-4xl font-bold">{month}</span>
                  <span className="mx-2 text-2xl">月</span>
                  <span className="text-4xl font-bold">{day}</span>
                  <span className="mx-2 text-2xl">日</span>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setMonth((m) => m + 1)}
                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
                  >
                    月+1
                  </button>
                  <button
                    type="button"
                    onClick={() => setDay((d) => d + 1)}
                    className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 py-3 font-semibold"
                  >
                    日+1
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full rounded-2xl bg-yellow-200 border border-gray-300 dark:border-gray-700 py-3 font-semibold"
                >
                  ヒント
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={
                questionnaireStep === 0
                  ? handleRetry
                  : questionnaireStep === 2
                    ? () => {
                        setMonth((m) => m + 1);
                        setDay((d) => d + 1);
                      }
                    : handleSubmitAnswer
              }
              disabled={questionnaireStep !== 2 && !selectedAnswer}
              className="w-full rounded-2xl bg-blue-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {questionnaireStep === 0
                ? "Return"
                : questionnaireStep === 1
                  ? "私はこう思う！"
                  : questionnaireStep === 2
                    ? "ꯍꯥꯞꯆꯤꯟꯕ" //マニプリ語で追加の意味
                    : "決定"}
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className={`w-full rounded-2xl py-3 font-semibold transition-all ${
                isDateOver && questionnaireStep === 2
                  ? "animate-bounce bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold scale-110"
                  : "border border-gray-300 dark:border-gray-700"
              }`}
            >
              やり直す
            </button>
          </div>
          {questionnaireStep === 0 && (
            <div className="absolute bottom-24 left-0">
              <button
                type="button"
                className="text-gray-400"
                onClick={handlePickClick}
              >
                ←pick
              </button>
            </div>
          )}
        </div>
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
      {isModalOpen && (
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
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border"
              >
                へい
              </button>
              <button
                onClick={() => {
                  handleSubmitAnswer();
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                わかりました
              </button>
            </div>
          </div>
        </div>
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
          <div className="grid grid-cols-3 gap-1 w-24 relative h-[7.5rem]">
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
