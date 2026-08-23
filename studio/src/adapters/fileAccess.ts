export async function pickJsonFile(): Promise<File | null> {
  if (typeof window.showOpenFilePicker !== "function") {
    return null;
  }

  const handles = await window.showOpenFilePicker({
    excludeAcceptAllOption: false,
    multiple: false,
    types: [{
      accept: { "application/json": [".json"] },
      description: "JSON files",
    }],
  });

  const handle = handles?.[0];
  if (!handle) {
    return null;
  }
  return handle.getFile();
}

export async function readJsonFile(file: File): Promise<unknown> {
  return JSON.parse(await file.text());
}
