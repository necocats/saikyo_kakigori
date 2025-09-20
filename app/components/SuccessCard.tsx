import type { OrderResponse } from "../api/client";
import kakigooriWhite from "../assets/kakigoori8_white.png";
import kakigooriRed from "../assets/kakigoori1_red.png";
import kakigooriGreen from "../assets/kakigoori5_green.png";
import kakigooriBlue from "../assets/kakigoori6_blue.png";
import kakigooriOrange from "../assets/kakigoori3_orange.png";
import kakigooriunknown from "../assets/kakigoori9_brown.png";

const STATUS_BADGE: Record<
  OrderResponse["status"],
  { label: string; color: string }
> = {
  pending: {
    label: "準備中",
    color:
      "bg-amber-100 text-amber-800 border border-amber-200 " +
      "dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800/40",
  },
  waitingPickup: {
    label: "呼出中",
    color:
      "bg-blue-100 text-blue-800 border border-blue-200 " +
      "dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800/40",
  },
  completed: {
    label: "受渡完了",
    color:
      "bg-emerald-100 text-emerald-800 border border-emerald-200 " +
      "dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800/40",
  },
};

export default function SuccessCard({ order }: { order: OrderResponse }) {
  const getOneImage = (menuItemId: string): string => {
    switch (menuItemId) {
      case "giiku-sai":
        return kakigooriRed;
      case "giiku-haku":
        return kakigooriGreen;
      case "giiku-ten":
        return kakigooriBlue;
      case "giiku-camp":
        return kakigooriOrange;
      default:
        return kakigooriunknown;
    }
  };

  // 注文番号を16桁の2進数文字列に変換
  const binaryOrderNumber = order.order_number.toString(2).padStart(16, "0");
  const oneImageSrc = getOneImage(order.menu_item_id);
  const zeroImageSrc = kakigooriWhite;

  return (
    <div className="mt-6 space-y-4">
      <div className="rounded-2xl border p-6 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          注文番号<sub>(2)</sub>
        </div>
        {/* 注文番号を画像による2進数表記で表示 */}
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {binaryOrderNumber.split("").map((bit, index) => (
            <img
              key={index}
              src={bit === "1" ? oneImageSrc : zeroImageSrc}
              alt={bit}
              className="w-8 h-8"
            />
          ))}
        </div>
        <div className="mt-3 font-medium">{order.menu_name}</div>
        <div
          className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
            STATUS_BADGE[order.status].color
          }`}
        >
          {STATUS_BADGE[order.status].label}
        </div>
      </div>
    </div>
  );
}
