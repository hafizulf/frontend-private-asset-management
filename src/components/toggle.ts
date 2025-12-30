type ToggleOptions = {
  checkbox: HTMLInputElement;
  label: HTMLElement;
  activeText?: string;
  inactiveText?: string;
};

type ToggleComponent = {
  get value(): boolean;
  set value(v: boolean);
};

export function createToggle({
  checkbox,
  label,
  activeText = "Active",
  inactiveText = "Inactive",
}: ToggleOptions): ToggleComponent {
  const sync = (): void => {
    label.textContent = checkbox.checked
      ? activeText
      : inactiveText;
  };

  checkbox.addEventListener("change", sync);
  sync();

  return {
    get value(): boolean {
      return checkbox.checked;
    },
    set value(v: boolean) {
      checkbox.checked = Boolean(v);
      sync();
    },
  };
}
