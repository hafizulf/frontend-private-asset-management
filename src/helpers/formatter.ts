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

export function getNumberRawValue(selector: string): number {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (!input || !input.value) return 0;

  const normalized = input.value
    .replace(/\./g, "")   // remove thousand separators
    .replace(/,/g, ".");  // convert decimal comma

  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function formatDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}
