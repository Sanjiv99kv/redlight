import React from "react";
import "./Footer.css"; // Reusing same CSS file

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const triggerURL = (url: string): void => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;

    document.body.appendChild(iframe);

    console.log("working");
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  return (
    <div className={`footer-menu ${isOpen ? "is-show" : ""}`}>
      <div className="footer-menu__overlay" onClick={onClose}></div>
      <div className="footer-menu__nav">
        <div className="footer-menu__inner">
          <ul className="footer-link">
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenuticket"
                );
              }}
              className="footer-link__item"
            >
              <a
                className="font-bold"
                href="https://www.suzukacircuit.jp/f1/ticket/index.html?utm_medium=lineeoa&utm_source=ln_miniapp_menu_ticket&utm_campaign=f1&utm_content=20250331"
              >
                チケット
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenuaccess"
                );
              }}
              className="footer-link__item"
            >
              <a
                className="font-bold"
                href="https://www.suzukacircuit.jp/f1/access/index.html?utm_medium=lineeoa&utm_source=ln_miniapp_menu_access&utm_campaign=f1&utm_content=20250331"
              >
                アクセス
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenuevent"
                );
              }}
              className="footer-link__item"
            >
              <a
                className="font-bold"
                href="https://miniapp.line.me/2007078799-0oWyrXee/eventcalender"
              >
                イベント情報
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenushop"
                );
              }}
              className="footer-link__item"
            >
              <a className="font-bold" href="https://goods.mobilitystation.jp/">
                オンラインショップ
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenumembers"
                );
              }}
              className="footer-link__item"
            >
              <a
                className="font-bold"
                href="https://ticket.mobilitystation.jp/"
              >
                会員限定
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenudazn"
                );
              }}
              className="footer-link__item"
            >
              <a
                className="font-bold"
                href="https://www.suzukacircuit.jp/f1/dazn.html?utm_medium=lineeoa&utm_source=ln_miniapp_menu_dazn&utm_campaign=f1&utm_content=20250331"
              >
                オンライン観戦
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenucontact"
                );
              }}
              className="footer-link__item"
            >
              <a
                className="font-bold"
                href="https://www.suzukacircuit.jp/contact_s/?utm_medium=lineeoa&utm_source=ln_miniapp_menu_contact&utm_campaign=f1&utm_content=20250331"
              >
                お問い合わせ
              </a>
            </li>
          </ul>
          <ul className="footer-sub">
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenuterms"
                );
              }}
              className="footer-sub__item"
            >
              <a
                className="font-bold"
                href="https://www.honda-ml.co.jp/legal/line/terms.html?utm_medium=lineeoa&utm_source=ln_miniapp_menu_terms&utm_campaign=f1&utm_content=20250331"
              >
                利用規約
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenuprivacy"
                );
              }}
              className="footer-sub__item"
            >
              <a
                className="font-bold"
                href="https://www.honda-ml.co.jp/privacy/?utm_medium=lineeoa&utm_source=ln_miniapp_menu_privacy&utm_campaign=f1&utm_content=20250331"
              >
                プライバシーポリシー
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenucredit"
                );
              }}
              className="footer-sub__item"
            >
              <a
                className="font-bold"
                href="https://www.honda-ml.co.jp/legal/line/credit.html?utm_medium=lineeoa&utm_source=ln_miniapp_menu_credit&utm_campaign=f1&utm_content=20250331"
              >
                クレジットライセンス
              </a>
            </li>
          </ul>
          <ul className="footer-sns">
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenuinstagram"
                );
              }}
              className="footer-sns__item"
            >
              <a
                className="font-bold"
                href="https://www.instagram.com/f1japanesegp/"
              >
                <img src="/FooterIcons/footer_sns_01.svg" alt="Instagram" />
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenufacebook"
                );
              }}
              className="footer-sns__item"
            >
              <a
                className="font-bold"
                href="https://www.facebook.com/suzukacircuit/"
              >
                <img src="/FooterIcons/footer_sns_02.svg" alt="Facebook" />
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenux"
                );
              }}
              className="footer-sns__item"
            >
              <a className="font-bold" href="https://twitter.com/suzuka_event">
                <img src="/FooterIcons/footer_sns_03.svg" alt="X" />
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenuyoutube"
                );
              }}
              className="footer-sns__item"
            >
              <a
                className="font-bold"
                href="https://www.youtube.com/channel/UCbVkZ41otxc8rCAu7_gsO6Q"
              >
                <img src="/FooterIcons/footer_sns_04.svg" alt="YouTube" />
              </a>
            </li>
            <li
              onClick={() => {
                triggerURL(
                  "https://app.dialogone.jp/v1/linelogin/auth/414a525aca27bd66?index=20250329appmenutiktok"
                );
              }}
              className="footer-sns__item"
            >
              <a
                className="font-bold"
                href="https://www.tiktok.com/@suzuka.circuit.park?lang=ja-JP"
              >
                <img src="/FooterIcons/footer_sns_05.svg" alt="TikTok" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
