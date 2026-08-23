/// <reference types="vite/client" />

interface Window {
  showOpenFilePicker?: (options?: {
    excludeAcceptAllOption?: boolean;
    multiple?: boolean;
    types?: Array<{
      accept: Record<string, string[]>;
      description?: string;
    }>;
  }) => Promise<FileSystemFileHandle[]>;
}

interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;
  queryPermission?: (options?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (options?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
}

interface FileSystemFileHandle {
  kind?: "file";
  name: string;
  getFile: () => Promise<File>;
  createWritable?: () => Promise<FileSystemWritableFileStream>;
  queryPermission?: (options?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (options?: { mode?: "read" | "readwrite" }) => Promise<PermissionState>;
}

interface FileSystemWritableFileStream {
  write: (data: string | Blob | ArrayBuffer | ArrayBufferView) => Promise<void>;
  close: () => Promise<void>;
}
