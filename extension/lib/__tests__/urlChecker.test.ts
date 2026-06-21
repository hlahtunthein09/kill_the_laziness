import { describe, it, expect } from "vitest";
import { isForbiddenUrl, DEFAULT_FORBIDDEN_PATTERNS } from "../urlChecker";

describe("urlChecker.ts", () => {
  describe("isForbiddenUrl", () => {
    it("returns false for allowed URLs", () => {
      const allowedUrls = [
        "https://google.com",
        "https://github.com",
        "https://stackoverflow.com/questions/123",
        "https://youtube.com/watch?v=abc123",
        "https://youtube.com/",
        "https://instagram.com/",
        "https://facebook.com/groups/xyz",
        "https://docs.google.com",
        "https://developer.mozilla.org",
        "https://example.com",
      ];

      for (const url of allowedUrls) {
        expect(isForbiddenUrl(url, DEFAULT_FORBIDDEN_PATTERNS)).toBe(false);
      }
    });

    it("returns true for forbidden URLs", () => {
      const forbiddenUrls = [
        "https://youtube.com/shorts",
        "https://youtube.com/shorts/abc123",
        "https://www.youtube.com/shorts",
        "https://m.youtube.com/shorts",
        "https://instagram.com/reels",
        "https://www.instagram.com/reels/xyz",
        "https://tiktok.com",
        "https://www.tiktok.com/@user",
        "https://facebook.com/reels",
        "https://www.facebook.com/reels/video",
        "https://twitter.com",
        "https://twitter.com/home",
        "https://reddit.com",
        "https://www.reddit.com/r/programming",
        "https://old.reddit.com",
        "https://netflix.com",
        "https://www.netflix.com/browse",
      ];

      for (const url of forbiddenUrls) {
        expect(isForbiddenUrl(url, DEFAULT_FORBIDDEN_PATTERNS)).toBe(true);
      }
    });

    it("is case-insensitive", () => {
      expect(isForbiddenUrl("https://YOUTUBE.COM/SHORTS", DEFAULT_FORBIDDEN_PATTERNS)).toBe(true);
      expect(isForbiddenUrl("https://Reddit.com", DEFAULT_FORBIDDEN_PATTERNS)).toBe(true);
      expect(isForbiddenUrl("https://NetFlix.com", DEFAULT_FORBIDDEN_PATTERNS)).toBe(true);
    });

    it("returns false for empty patterns list", () => {
      expect(isForbiddenUrl("https://youtube.com/shorts", [])).toBe(false);
    });

    it("returns false for empty URL", () => {
      expect(isForbiddenUrl("", DEFAULT_FORBIDDEN_PATTERNS)).toBe(false);
    });

    it("works with custom patterns", () => {
      const customPatterns = ["example.com/bad", "evil.site"];
      expect(isForbiddenUrl("https://example.com/bad/page", customPatterns)).toBe(true);
      expect(isForbiddenUrl("https://evil.site/page", customPatterns)).toBe(true);
      expect(isForbiddenUrl("https://example.com/good", customPatterns)).toBe(false);
    });
  });

  describe("DEFAULT_FORBIDDEN_PATTERNS", () => {
    it("contains all expected default patterns", () => {
      expect(DEFAULT_FORBIDDEN_PATTERNS).toContain("youtube.com/shorts");
      expect(DEFAULT_FORBIDDEN_PATTERNS).toContain("instagram.com/reels");
      expect(DEFAULT_FORBIDDEN_PATTERNS).toContain("tiktok.com");
      expect(DEFAULT_FORBIDDEN_PATTERNS).toContain("facebook.com/reels");
      expect(DEFAULT_FORBIDDEN_PATTERNS).toContain("twitter.com");
      expect(DEFAULT_FORBIDDEN_PATTERNS).toContain("reddit.com");
      expect(DEFAULT_FORBIDDEN_PATTERNS).toContain("netflix.com");
      expect(DEFAULT_FORBIDDEN_PATTERNS).toHaveLength(7);
    });
  });
});
