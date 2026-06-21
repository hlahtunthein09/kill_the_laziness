import { describe, it, expect, beforeEach } from "vitest";
import { injectWarnOverlay } from "../warnOverlay";

describe("warnOverlay.ts", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("appends an overlay to document.body", () => {
    expect(document.getElementById("ff-warn-overlay")).toBeNull();

    injectWarnOverlay({
      my: "စိတ်ဓာတ်မကျပါနဲ့!",
      en: "Don't give up!",
    });

    const overlay = document.getElementById("ff-warn-overlay");
    expect(overlay).not.toBeNull();
    expect(document.body.contains(overlay)).toBe(true);
  });

  it("returns a cleanup function that removes the overlay", () => {
    const cleanup = injectWarnOverlay({
      my: "စိတ်ဓာတ်မကျပါနဲ့!",
      en: "Don't give up!",
    });

    const overlay = document.getElementById("ff-warn-overlay");
    expect(overlay).not.toBeNull();

    cleanup();

    expect(document.getElementById("ff-warn-overlay")).toBeNull();
    expect(document.body.contains(overlay)).toBe(false);
  });

  it('removes existing overlay before injecting a new one', () => {
    injectWarnOverlay({ my: 'ပထမ', en: 'First' });
    const first = document.getElementById('ff-warn-overlay');
    expect(first).not.toBeNull();

    injectWarnOverlay({ my: 'ဒုတိယ', en: 'Second' });
    const second = document.getElementById('ff-warn-overlay');
    expect(second).not.toBeNull();
    expect(second).not.toBe(first);
    expect(document.body.contains(first)).toBe(false);
  });

  it('renders Burmese title and English subtitle', () => {
    injectWarnOverlay({
      my: 'စိတ်ဓာတ်မကျပါနဲ့!',
      en: "Don't give up!",
    });

    const overlay = document.getElementById('ff-warn-overlay');
    expect(overlay).not.toBeNull();

    const h2 = overlay!.querySelector('h2');
    expect(h2?.textContent).toBe('စိတ်ဓာတ်မကျပါနဲ့!');

    const p = overlay!.querySelector('p');
    expect(p?.textContent).toBe("Don't give up!");
  });

  it('renders both buttons', () => {
    injectWarnOverlay({
      my: 'စိတ်ဓာတ်မကျပါနဲ့!',
      en: "Don't give up!",
    });

    const overlay = document.getElementById('ff-warn-overlay');
    const buttons = overlay!.querySelectorAll('button');
    expect(buttons.length).toBe(2);

    const backBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes('Back to Focus')
    );
    expect(backBtn).not.toBeUndefined();

    const continueBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes('Continue anyway')
    );
    expect(continueBtn).not.toBeUndefined();
  });

  it('clicking "Continue anyway" removes the overlay', () => {
    injectWarnOverlay({
      my: 'စိတ်ဓာတ်မကျပါနဲ့!',
      en: "Don't give up!",
    });

    const overlay = document.getElementById('ff-warn-overlay');
    expect(overlay).not.toBeNull();

    const continueBtn = Array.from(overlay!.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Continue anyway')
    );
    expect(continueBtn).not.toBeUndefined();

    continueBtn!.click();

    expect(document.getElementById('ff-warn-overlay')).toBeNull();
  });
});
