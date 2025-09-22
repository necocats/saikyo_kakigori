// 広告風バナー
import React, { useState } from "react";
import "../../css/AdBanner.css";

const AdBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  const handleClick = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <a
      className="ad-banner"
      href="https://nlab.itmedia.co.jp/cont/articles/3271793/"
      target="_blank"
    >
      <div
        className="ad-banner__close-button absolute top-0 right-0"
        onClick={handleClick}
      >
        ×
      </div>
      <span className="ad-banner__text">
        🙍‍♂️ 人間 vs コンピュータオセロ 勝負の行方は 🤖
      </span>
      <div className="ad-banner__link">詳しくはこちら</div>
    </a>
  );
};

export default AdBanner;
