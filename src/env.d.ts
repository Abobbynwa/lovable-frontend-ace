// src/env.d.ts
interface ImportMetaEnv {
  VITE_API_URL?: string;
  // add other Vite env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
