/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_DEV_ADMIN_EMAIL?: string
  readonly VITE_DEMO_PIN?: string
  readonly VITE_SACRED_SHEET_URL?: string
  readonly VITE_ADMIN_PIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
