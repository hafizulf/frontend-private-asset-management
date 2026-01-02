export function attachIdNumberFormatter(selector: string): void {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (!input) return;

  input.addEventListener("input", () => {
    const start = input.selectionStart ?? input.value.length;

    // keep digits + comma
    let raw = input.value.replace(/[^\d,]/g, "");

    // allow only ONE comma
    const parts = raw.split(",");
    if (parts.length > 2) {
      raw = parts[0] + "," + parts.slice(1).join("");
    }

    const [intPart, decPart] = raw.split(",");

    const formattedInt = intPart
      ? Number(intPart).toLocaleString("id-ID")
      : "";

    const formatted =
      decPart !== undefined
        ? `${formattedInt},${decPart}`
        : formattedInt;

    input.value = formatted;

    // restore caret
    const diff = formatted.length - raw.length;
    input.setSelectionRange(start + diff, start + diff);
  });
}

export function formatIDR(value: number | string): string {
  return Number(value).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export function capitalizeWords(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
}

export function parseQty(selector: string): number | null {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (!input) return null;

  const raw = input.value.trim();
  if (!raw) return null;

  const cleaned = raw.replace(/[^\d.,-]/g, "");

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(/,/g, ".")
    : cleaned; // keep dot as decimal if no comma

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function parseIDRCurrency(selector: string): number | null {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (!input) return null;

  const raw = input.value.trim();
  if (!raw) return null;

  const cleaned = raw.replace(/[^\d.,-]/g, "");

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  let normalized = cleaned;

  if (hasComma && hasDot) {
    // "218.000,50" -> "218000.50"
    normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  } else if (hasComma) {
    // "218000,50" -> "218000.50"
    normalized = cleaned.replace(/,/g, ".");
  } else if (hasDot) {
    // Decide thousands vs decimal:
    // If groups after the first are all length 3 -> thousands ("218.000" / "1.234.567")
    const parts = cleaned.split(".");
    const looksLikeThousands = parts.length > 1 && parts.slice(1).every(p => p.length === 3);
    normalized = looksLikeThousands ? parts.join("") : cleaned; // keep decimal like "0.09"
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

