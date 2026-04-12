# Trackademic

Smart grade optimization for students — with Google Sign-In, per-user private data, and shared community features.

---

## What's New: Auth & Privacy

| Data | Storage | Who can see it |
|------|---------|----------------|
| Grade components & entries | Supabase (per user) | **You only** |
| Saved grades | Supabase (per user) | **You only** |
| GWA entries | Supabase (per user) | **You only** |
| App settings (target, premium) | Supabase (per user) | **You only** |
| Forum posts | Supabase (shared) | **Everyone** |
| Community templates | Supabase (shared) | **Everyone** |

---

## Setup

### 1. Clone & install
```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
# Client-side (browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Server-side (Vercel API routes)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these in: **Supabase Dashboard → Settings → API**

### 3. Enable Google OAuth in Supabase

1. Go to **Supabase Dashboard → Authentication → Providers → Google**
2. Enable it and paste your **Google OAuth Client ID & Secret**
3. Get those from [console.cloud.google.com](https://console.cloud.google.com):
   - Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
   - **Authorized redirect URI**: `https://your-project.supabase.co/auth/v1/callback`
   - **Authorized JavaScript origins** (for local dev): `http://localhost:5173`

### 4. Run the SQL migration

In your **Supabase SQL Editor**, paste and run `supabase-auth-setup.sql`.

This adds `author_id` columns to forum/templates and enables Row Level Security.

### 5. Run locally
```bash
npm run dev
```

### 6. Deploy to Vercel
```bash
vercel --prod
```

Add all env vars in **Vercel Dashboard → Settings → Environment Variables**.
Add your production domain to **Google Console → Authorized JavaScript origins**.

---

## App Flow

```
/  →  Sign In page (Google OAuth)
        ↓
      Landing Page  →  choose Free or Premium
        ↓
      Dashboard  (grade tracker, AI coach, strategies, etc.)
```

- Click your avatar in the header → returns to Landing Page (switch plan)
- Sign Out → clears session → back to Sign In

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Auth**: Supabase Auth (Google OAuth via PKCE)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Hosting**: Vercel (serverless API routes + static frontend)
