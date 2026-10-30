export function showToast(element: HTMLElement, message: string, isError = false): void {
  window.clearTimeout(Number(element.dataset.timeout ?? 0));
  element.textContent = message;
  element.classList.toggle('toast--error', isError);
  element.hidden = false;
  const timeout = window.setTimeout(() => {
    element.hidden = true;
  }, 3200);
  element.dataset.timeout = String(timeout);
}
