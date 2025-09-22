// たのしいクイズ
import { useState } from "react";
import { HintModal } from "./HintModal";

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

export function Questionnaire({
  onComplete,
  onRetry,
}: {
  onComplete: (answers: string[]) => void;
  onRetry: () => void;
}) {
  const [questionnaireStep, setQuestionnaireStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNextQuestion = () => {
    const answerToSave =
      questionnaireStep === 2 ? `${month}月${day}日` : selectedAnswer;
    if (answerToSave) {
      const newAnswers = [...answers, answerToSave];
      setAnswers(newAnswers);
      setSelectedAnswer("");
      if (questionnaireStep + 1 < questions.length) {
        setQuestionnaireStep(questionnaireStep + 1);
      } else {
        onComplete(newAnswers);
      }
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
        onComplete([...answers, selectedAnswer]);
      } else {
        alert(
          "残念ですが不正解です。検索して調べてみましょう。ちなみに最初からやり直しだよ"
        );
        onRetry();
      }
    } else if (questionnaireStep === 2) {
      if (month === 7 && day === 25) {
        alert("正解です！");
        handleNextQuestion();
      } else {
        alert("わかってないじゃん・・・嘘つかないでよ");
        onRetry();
      }
    } else {
      if (!selectedAnswer) return;
      handleNextQuestion();
    }
  };

  const handlePickClick = () => {
    if (selectedAnswer === "はい") {
      handleNextQuestion();
    } else if (selectedAnswer === "いいえ") {
      alert("精神的に向上心の無いものはばかだ。");
      onRetry();
    }
  };

  const currentQuestion = questions[questionnaireStep];
  const isDateOver = month > 7 || day > 25;

  return (
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
              ? onRetry
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
          onClick={onRetry}
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
        <div className="absolute bottom-4 left-0">
          <button
            type="button"
            className="text-gray-400"
            onClick={handlePickClick}
          >
            ←pick
          </button>
        </div>
      )}
      {questionnaireStep !== 0 && (
        <div className="absolute bottom-4 left-0">
          <button type="button" className="text-gray-400" onClick={onRetry}>
            ←back
          </button>
        </div>
      )}

      <HintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => {
          handleSubmitAnswer();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
