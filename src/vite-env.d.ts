/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_APP_DESCRIPTION?: string;
  readonly VITE_GOOGLE_BOOKS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
