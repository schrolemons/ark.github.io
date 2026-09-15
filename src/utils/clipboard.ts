export async function copyCurrentLink(): Promise<boolean> {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const previousFocus = document.activeElement as HTMLElement | null;
    const input = document.createElement('textarea');
    input.value = url;
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    input.readOnly = true;
    document.body.appendChild(input);
    input.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* Report failure to the user. */ }
    input.remove();
    previousFocus?.focus({ preventScroll: true });
    return copied;
  }
}
