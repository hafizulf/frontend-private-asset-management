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
