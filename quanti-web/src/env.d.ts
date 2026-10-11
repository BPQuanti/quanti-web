declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APP_URL?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    RESEND_API_KEY?: string;
    WAITLIST_FROM_EMAIL?: string;
    CRON_SECRET?: string;
    XAI_API_KEY?: string;
    GROK_API_KEY?: string;
    XAI_MODEL?: string;
  }
}
