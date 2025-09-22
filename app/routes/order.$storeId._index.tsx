import { useState } from "react";
import { Agreement } from "../components/Question/Agreement";
import { Questionnaire } from "../components/Question/Questionnaire";
import { OrderForm } from "../components/Order/OrderForm";
import AdBanner from "../components/Order/AdBanner";

export default function OrderPage() {
  const [agreedToQuestionnaire, setAgreedToQuestionnaire] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);

  const handleRetry = () => {
    setAgreedToQuestionnaire(false);
    setQuestionnaireCompleted(false);
  };

  return (
    <>
      <main className="mx-auto max-w-sm p-4 min-h-[100dvh] flex flex-col justify-start">
        <h1 className="text-2xl font-bold text-center">かき氷注文システム</h1>
        {!agreedToQuestionnaire ? (
          <Agreement onAgree={() => setAgreedToQuestionnaire(true)} />
        ) : !questionnaireCompleted ? (
          <Questionnaire
            onComplete={() => setQuestionnaireCompleted(true)}
            onRetry={handleRetry}
          />
        ) : (
          <>
            <OrderForm />
            <AdBanner />
          </>
        )}
      </main>
    </>
  );
}
