export async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available in this environment.");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }

  if (!copied) {
    throw new Error("Clipboard write failed.");
  }
}

export async function readTextFromClipboard(): Promise<string> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
    return navigator.clipboard.readText();
  }

  throw new Error("Clipboard read is not available in this environment.");
}
