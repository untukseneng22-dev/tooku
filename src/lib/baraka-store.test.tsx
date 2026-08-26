import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BarakaProvider, useBaraka } from "./baraka-store";

function StoreConsumer() {
  const { products } = useBaraka();
  return <p>Produk tersedia: {products.length}</p>;
}

describe("useBaraka", () => {
  it("menolak penggunaan di luar BarakaProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<StoreConsumer />)).toThrow(
      "useBaraka must be used inside BarakaProvider",
    );

    consoleError.mockRestore();
  });

  it("menyediakan store saat dibungkus BarakaProvider", () => {
    render(
      <BarakaProvider>
        <StoreConsumer />
      </BarakaProvider>,
    );

    expect(screen.getByText(/Produk tersedia: [1-9]/)).toBeInTheDocument();
  });

  it("memblokir BarakaProvider ganda saat development", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <BarakaProvider>
        <BarakaProvider>
          <StoreConsumer />
        </BarakaProvider>
      </BarakaProvider>,
    );

    expect(screen.getByText(/Produk tersedia: [1-9]/)).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining("Duplicate BarakaProvider blocked"));
    consoleError.mockRestore();
  });
});
