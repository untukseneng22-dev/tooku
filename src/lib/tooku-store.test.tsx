import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TookuProvider, useTooku } from "./tooku-store";

function StoreConsumer() {
  const { products } = useTooku();
  return <p>Produk tersedia: {products.length}</p>;
}

describe("useTooku", () => {
  it("menolak penggunaan di luar TookuProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<StoreConsumer />)).toThrow(
      "useTooku must be used inside TookuProvider",
    );

    consoleError.mockRestore();
  });

  it("menyediakan store saat dibungkus TookuProvider", () => {
    render(
      <TookuProvider>
        <StoreConsumer />
      </TookuProvider>,
    );

    expect(screen.getByText(/Produk tersedia: [1-9]/)).toBeInTheDocument();
  });

  it("memblokir TookuProvider ganda saat development", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <TookuProvider>
        <TookuProvider>
          <StoreConsumer />
        </TookuProvider>
      </TookuProvider>,
    );

    expect(screen.getByText(/Produk tersedia: [1-9]/)).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("Duplicate TookuProvider blocked"));
    consoleError.mockRestore();
  });
});
