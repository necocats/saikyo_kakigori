// 十字キーとボタンのコンポーネント
export function Controller({
  onDpad,
  onAButton,
  onBButton,
}: {
  onDpad: (direction: "up" | "down" | "right") => void;
  onAButton: () => void;
  onBButton: () => void;
}) {
  const handleXButton = () => {
    window.open("https://x.com/geek_pjt");
  };
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-4 flex justify-center items-center gap-16 w-full max-w-sm bg-white dark:bg-gray-800">
      <div className="grid grid-cols-3 gap-1 w-24">
        <div />
        <button
          type="button"
          onClick={() => onDpad("up")}
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
          onClick={() => onDpad("right")}
          className="bg-gray-300 dark:bg-gray-700 rounded-md p-2"
        >
          ▶
        </button>
        <div />
        <button
          type="button"
          onClick={() => onDpad("down")}
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
            onClick={handleXButton}
            className="bg-black text-white rounded-full w-10 h-10 flex items-center justify-center"
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
            onClick={onAButton}
            className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            A
          </button>
        </div>
        <div className="col-start-2 row-start-3 flex justify-center items-center">
          <button
            type="button"
            onClick={onBButton}
            className="bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            B
          </button>
        </div>
      </div>
    </div>
  );
}
