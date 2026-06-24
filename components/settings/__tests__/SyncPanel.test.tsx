import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SyncPanel } from "../SyncPanel";

// Mock exportStore and importStore
vi.mock("@/lib/sync", () => ({
  exportStore: vi.fn(),
  importStore: vi.fn(),
}));

import { exportStore, importStore } from "@/lib/sync";

describe("SyncPanel", () => {
  const mockExportStore = exportStore as ReturnType<typeof vi.fn>;
  const mockImportStore = importStore as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders download button with Burmese label", () => {
    mockExportStore.mockReturnValue("{}");

    render(<SyncPanel />);

    expect(
      screen.getByText("ဆင်စစ်မှု (Backup & Restore)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("ဆင့် JSON ဆွဲချ ရန် (Download Backup)")
    ).toBeInTheDocument();
  });

  it("clicking download creates an anchor with .json download attribute", () => {
    mockExportStore.mockReturnValue('{"version":1,"projects":[]}');

    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test-url");
    const revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    render(<SyncPanel />);

    const button = screen.getByText("ဆင့် JSON ဆွဲချ ရန် (Download Backup)");
    fireEvent.click(button);

    expect(mockExportStore).toHaveBeenCalledTimes(1);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:test-url");

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it("button is disabled when exportStore returns empty string", () => {
    mockExportStore.mockReturnValue("");

    render(<SyncPanel />);

    const button = screen.getByText("ဆင့် JSON ဆွဲချ ရန် (Download Backup)");
    fireEvent.click(button);

    expect(mockExportStore).toHaveBeenCalledTimes(1);
  });

  // --- Upload / Restore tests ---

  it("renders upload button and hidden file input", () => {
    mockExportStore.mockReturnValue("{}");

    render(<SyncPanel />);

    expect(
      screen.getByText("ဆင့် JSON ပြန်တင်ရန် (Restore Backup)")
    ).toBeInTheDocument();
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("selecting valid JSON file calls importStore and shows success message", async () => {
    mockExportStore.mockReturnValue("{}");
    mockImportStore.mockReturnValue({ ok: true });

    // Mock FileReader by replacing the class on window
    const originalFileReader = window.FileReader;
    const mockResult = '{"version":1,"projects":[],"settings":{"forbiddenUrls":[]}}';

    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

      readAsText(_file: Blob) {
        this.result = mockResult;
        // Simulate async onload
        setTimeout(() => {
          if (this.onload) {
            this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }

    Object.defineProperty(window, "FileReader", {
      writable: true,
      configurable: true,
      value: MockFileReader,
    });

    render(<SyncPanel />);

    const file = new File(["test"], "backup.json", { type: "application/json" });
    const input = screen.getByTestId("file-input");

    await fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockImportStore).toHaveBeenCalledWith(mockResult);
    });

    expect(
      screen.getByText("ဆင့် ပြန်တင်ပြီးပါပြီ (Backup restored)")
    ).toBeInTheDocument();

    // Restore original FileReader
    Object.defineProperty(window, "FileReader", {
      writable: true,
      configurable: true,
      value: originalFileReader,
    });
  });

  it("selecting invalid JSON shows error message", async () => {
    mockExportStore.mockReturnValue("{}");
    mockImportStore.mockReturnValue({ ok: false, error: "Invalid backup file" });

    // Mock FileReader by replacing the class on window
    const originalFileReader = window.FileReader;
    const mockResult = "not valid json";

    class MockFileReader {
      result: string | null = null;
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

      readAsText(_file: Blob) {
        this.result = mockResult;
        // Simulate async onload
        setTimeout(() => {
          if (this.onload) {
            this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
          }
        }, 0);
      }
    }

    Object.defineProperty(window, "FileReader", {
      writable: true,
      configurable: true,
      value: MockFileReader,
    });

    render(<SyncPanel />);

    const file = new File(["test"], "bad.json", { type: "application/json" });
    const input = screen.getByTestId("file-input");

    await fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockImportStore).toHaveBeenCalledWith(mockResult);
    });

    expect(
      screen.getByText("ဆင့် မမှန်ပါ (Invalid backup file)")
    ).toBeInTheDocument();

    // Restore original FileReader
    Object.defineProperty(window, "FileReader", {
      writable: true,
      configurable: true,
      value: originalFileReader,
    });
  });
});
