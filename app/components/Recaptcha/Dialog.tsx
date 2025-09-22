// Recaptcha風モーダル
import { Dialog } from "@headlessui/react";
import Othello from "./Othello";
import React from "react";

interface RecaptchaDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RecaptchaDialog: React.FC<RecaptchaDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30 z-40" aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex text-gray-800 items-center justify-center">
        <div className="relative bg-white rounded-xl p-8 mx-auto max-w-xs w-full shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">
            ロボットでないことを証明してください
          </h2>
          <Othello onLose={onSuccess} />
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
            onClick={onClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default RecaptchaDialog;
