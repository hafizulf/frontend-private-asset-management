export function attachCurrencyFormatter(selector: string) {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (!input) return;

  input.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    let value = target.value.replace(/\D/g, ""); // strip non-digits
    target.value = value ? Number(value).toLocaleString("id-ID") : "";
  });
}

export function getNumberRawValue(selector: string): number {
  const input = document.querySelector<HTMLInputElement>(selector);
  if (!input) return 0;
  return Number(input.value.replace(/\./g, "").replace(/,/g, ""));
}

export function formatDateToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}
