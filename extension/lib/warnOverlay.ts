/**
 * FocusFlow AI — Warn Overlay
 *
 * Injects a calming full-screen overlay on distracting sites.
 * Used by the warn-mode content script.
 */

export interface WarnOverlayMessage {
  my: string;
  en: string;
}

const OVERLAY_ID = "ff-warn-overlay";

/**
 * Inject a warn overlay into the current page.
 * Returns a cleanup function that removes the overlay from the DOM.
 */
export function injectWarnOverlay(message: WarnOverlayMessage): () => void {
  // Remove any existing overlay
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) {
    existing.remove();
  }

  // Overlay container — full screen, semi-transparent backdrop
  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.setAttribute(
    "style",
    [
      "position: fixed",
      "inset: 0",
      "z-index: 99999",
      "display: flex",
      "align-items: center",
      "justify-content: center",
      "background-color: rgba(20, 184, 166, 0.15)", // teal-500 at 15%
      "font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    ].join("; ")
  );

  // Centered card
  const card = document.createElement("div");
  card.setAttribute(
    "style",
    [
      "background-color: #ffffff",
      "border-radius: 16px",
      "padding: 32px 28px",
      "max-width: 420px",
      "width: 90%",
      "box-shadow: 0 10px 40px rgba(0,0,0,0.12)",
      "text-align: center",
    ].join("; ")
  );

  // Burmese title
  const title = document.createElement("h2");
  title.textContent = message.my;
  title.setAttribute(
    "style",
    [
      "margin: 0 0 8px 0",
      "font-size: 20px",
      "font-weight: 700",
      "color: #1c1917", // stone-900
      "line-height: 1.4",
    ].join("; ")
  );

  // English subtitle
  const subtitle = document.createElement("p");
  subtitle.textContent = message.en;
  subtitle.setAttribute(
    "style",
    [
      "margin: 0 0 24px 0",
      "font-size: 15px",
      "color: #78716c", // stone-500
      "line-height: 1.5",
    ].join("; ")
  );

  // Button row
  const buttonRow = document.createElement("div");
  buttonRow.setAttribute(
    "style",
    [
      "display: flex",
      "gap: 12px",
      "justify-content: center",
      "flex-wrap: wrap",
    ].join("; ")
  );

  // "Back to Focus" button
  const backBtn = document.createElement("button");
  backBtn.textContent = "ပြန်ဖocus လုပ်မယ် (Back to Focus)";
  backBtn.setAttribute(
    "style",
    [
      "padding: 10px 20px",
      "border-radius: 10px",
      "border: none",
      "background-color: #14b8a6", // teal-500
      "color: #ffffff",
      "font-size: 14px",
      "font-weight: 600",
      "cursor: pointer",
      "transition: background-color 0.2s",
    ].join("; ")
  );
  backBtn.addEventListener("mouseenter", () => {
    backBtn.style.backgroundColor = "#0d9488"; // teal-600
  });
  backBtn.addEventListener("mouseleave", () => {
    backBtn.style.backgroundColor = "#14b8a6"; // teal-500
  });
  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  });

  // "Continue anyway" button
  const continueBtn = document.createElement("button");
  continueBtn.textContent = "ဆက်ကြည့်မယ် (Continue anyway)";
  continueBtn.setAttribute(
    "style",
    [
      "padding: 10px 20px",
      "border-radius: 10px",
      "border: 1px solid #d6d3d1", // stone-300
      "background-color: #ffffff",
      "color: #78716c", // stone-500
      "font-size: 14px",
      "font-weight: 500",
      "cursor: pointer",
      "transition: background-color 0.2s",
    ].join("; ")
  );
  continueBtn.addEventListener("mouseenter", () => {
    continueBtn.style.backgroundColor = "#f5f5f4"; // stone-100
  });
  continueBtn.addEventListener("mouseleave", () => {
    continueBtn.style.backgroundColor = "#ffffff";
  });
  continueBtn.addEventListener("click", () => {
    overlay.remove();
  });

  buttonRow.appendChild(backBtn);
  buttonRow.appendChild(continueBtn);

  card.appendChild(title);
  card.appendChild(subtitle);
  card.appendChild(buttonRow);
  overlay.appendChild(card);

  document.body.appendChild(overlay);

  // Cleanup function
  return () => {
    overlay.remove();
  };
}
