# Duane Syndrome Portal — First-Time Setup Guide

Follow these steps in order. Each step takes ~5-15 minutes. Total setup time: ~2 hours.

---

## Prerequisites

- Node.js 20+ installed
- A GitHub account
- A Google account (for OAuth + Gemini API)
- A Facebook account (for OAuth)
- A credit card (for domain registration only — all services below are free tier)

---

## Step 1: Push to GitHub

```bash
# From the project root
git add -A
git commit -m "Initial commit: Duane Syndrome Portal"

# Create a new repo at https://github.com/new
# Name it: duane-syndrome-portal (or whatever you prefer)
# Make it Public (free GitHub Actions)
# Do NOT initialize with README

git remote add origin https://github.com/YOUR_USERNAME/duane-syndrome-portal.git
git branch -M main
git push -u origin main
```

---

## Step 2: Register Domain (~$12/year)

### Option A: duane-syndrome.com (recommended for SEO)
1. Go to [Namecheap](https://namecheap.com), [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/), or [Google Domains](https://domains.google)
2. Search for `duane-syndrome.com`
3. Purchase (typically ~$12/year)
4. Also purchase `duane.life` if available (optional redirect domain)

### Option B: Use Vercel's free `.vercel.app` subdomain first
- Skip this step and configure custom domain later
- Your site will be at `your-project.vercel.app`

---

## Step 3: Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New... > Project"**
3. Import your `duane-syndrome-portal` repository
4. Framework Preset: **Next.js** (auto-detected)
5. Leave all settings as default
6. Click **Deploy**
7. Wait ~2 minutes for the first build

### Connect Custom Domain
1. In your Vercel project, go to **Settings > Domains**
2. Add `duane-syndrome.com`
3. Vercel will show you DNS records to add:
   - **A record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`
4. Go to your domain registrar and add these DNS records
5. Wait 5-30 minutes for DNS propagation
6. Vercel will auto-provision an SSL certificate

### If using duane.life as redirect:
1. Also add `duane.life` in Vercel Domains
2. Set it to **redirect** to `duane-syndrome.com`

---

## Step 4: Set Up Sanity CMS (Free)

1. Go to [sanity.io](https://www.sanity.io/) and create a free account
2. Click **"Create new project"**
   - Name: `Duane Syndrome Portal`
   - Dataset: `production` (default)
   - Plan: **Free** (3 users, 500K API requests/mo)
3. Note your **Project ID** (shown on the project dashboard)
4. Go to **Settings > API > Tokens**
   - Create a token with **Editor** permissions
   - Name: `nextjs-app`
   - Copy the token (you won't see it again)
5. Go to **Settings > API > CORS Origins**
   - Add: `https://duane-syndrome.com` (allow credentials)
   - Add: `http://localhost:3000` (for local dev, allow credentials)

### Add to Vercel Environment Variables:
In your Vercel project → **Settings > Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_TOKEN` | The editor token you created |

### Test it:
After redeploying, visit `https://duane-syndrome.com/admin` — you should see the Sanity Studio. Create a test blog post to verify the integration.

---

## Step 5: Set Up Turso Database (Free)

1. Go to [turso.tech](https://turso.tech/) and create a free account
2. Install the Turso CLI:
   ```bash
   # macOS
   brew install tursodatabase/tap/turso

   # or with npm
   npm install -g @turso/cli
   ```
3. Log in:
   ```bash
   turso auth login
   ```
4. Create a database:
   ```bash
   turso db create duane-portal
   ```
5. Get connection details:
   ```bash
   turso db show duane-portal --url
   # Output: libsql://duane-portal-YOURUSERNAME.turso.io

   turso db tokens create duane-portal
   # Output: your auth token
   ```
6. Push the schema:
   ```bash
   # From the project root, create a .env.local file:
   echo 'TURSO_DATABASE_URL=libsql://duane-portal-YOURUSERNAME.turso.io' >> .env.local
   echo 'TURSO_AUTH_TOKEN=your-token-here' >> .env.local

   # Generate and push migrations:
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

### Add to Vercel Environment Variables:

| Variable | Value |
|----------|-------|
| `TURSO_DATABASE_URL` | `libsql://duane-portal-YOURUSERNAME.turso.io` |
| `TURSO_AUTH_TOKEN` | Your token |

---

## Step 6: Set Up Auth.js / OAuth (Free)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: `Duane Syndrome Portal`
3. Go to **APIs & Services > OAuth consent screen**
   - User Type: **External**
   - App name: `Duane Syndrome Portal`
   - Support email: your email
   - Authorized domains: `duane-syndrome.com`
   - Save
4. Go to **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Name: `Duane Portal Web`
   - Authorized redirect URIs:
     - `https://duane-syndrome.com/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (for dev)
   - Copy the **Client ID** and **Client Secret**

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps > Create App**
   - Type: **Consumer**
   - Name: `Duane Syndrome Portal`
3. Under **Facebook Login > Settings**:
   - Valid OAuth Redirect URIs:
     - `https://duane-syndrome.com/api/auth/callback/facebook`
     - `http://localhost:3000/api/auth/callback/facebook`
4. Go to **Settings > Basic**
   - Copy **App ID** and **App Secret**
5. Toggle app to **Live** mode (under the app toggle at top)

### Generate AUTH_SECRET
```bash
openssl rand -base64 32
# or
npx auth secret
```

### Add to Vercel Environment Variables:

| Variable | Value |
|----------|-------|
| `AUTH_SECRET` | Generated random string |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `AUTH_FACEBOOK_ID` | Facebook App ID |
| `AUTH_FACEBOOK_SECRET` | Facebook App Secret |

---

## Step 7: Set Up Resend Email (Free: 3K emails/month)

1. Go to [resend.com](https://resend.com/) and create a account
2. Go to **Domains > Add Domain**
   - Add `duane-syndrome.com`
   - Resend will show DNS records (TXT, CNAME) to add
   - Add them at your domain registrar
   - Wait for verification (up to 72 hours, usually minutes)
3. Go to **API Keys > Create API Key**
   - Name: `duane-portal`
   - Permission: **Sending access**
   - Copy the key

### Add to Vercel Environment Variables:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | Your Resend API key |

---

## Step 8: Set Up Gemini AI (Free: 1,500 requests/day)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key** in the top left
3. Create an API key (select the same Google Cloud project or create new)
4. Copy the key

### Add to Vercel Environment Variables:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini API key |

---

## Step 9: Set Up GitHub Actions Cron (Free)

The daily research paper fetcher runs via GitHub Actions.

1. Generate a cron secret:
   ```bash
   openssl rand -base64 32
   ```
2. In your GitHub repo → **Settings > Secrets and variables > Actions**
   - Add secrets:
     - `CRON_SECRET`: The generated secret
     - `SITE_URL`: `https://duane-syndrome.com`

3. Also add `CRON_SECRET` to Vercel Environment Variables:

| Variable | Value |
|----------|-------|
| `CRON_SECRET` | Same secret as GitHub |

The workflow at `.github/workflows/fetch-research.yml` runs daily at 6 AM UTC. You can also trigger it manually from the **Actions** tab.

---

## Step 10: Redeploy & Verify

After adding all environment variables in Vercel:

1. Go to your Vercel project → **Deployments**
2. Click the **...** menu on the latest deployment → **Redeploy**
3. Wait for the build to complete

### Verification Checklist:

| Page | What to verify |
|------|---------------|
| `/` | Home page loads with hero, persona selector, featured cards |
| `/en/about` | Medical information displays |
| `/en/about/faq` | FAQ items expand/collapse |
| `/en/blog` | Blog listing shows posts (seed data initially) |
| `/en/specialists` | Specialist directory with filters works |
| `/en/research` | Research papers with AI summary tabs |
| `/en/community` | Community links and sub-sections |
| `/en/community/stories` | Success stories display |
| `/en/community/mentors` | Mentor/mentee board |
| `/en/community/spotlight` | Spotlight people |
| `/en/legal` | Legal info by country |
| `/en/life-hacks` | Life hacks with persona filter |
| `/en/tools/gaze-simulator` | Interactive eye simulator controls work |
| `/en/tools/screening` | Screening wizard goes through all questions |
| `/en/tools/one-pager` | Card generator form and print preview |
| `/en/tools/explain-templates` | Templates generate and copy works |
| `/en/tools/emergency-card` | Emergency card generates and prints |
| `/en/tools/exercise-tracker` | Exercise checkboxes persist, streak counts |
| `/en/submit` | Submission form shows fields for each type |
| `/en/subscribe` | Subscribe form present |
| `/he/*` | Hebrew pages load with RTL layout |
| `/admin` | Sanity Studio loads (requires Sanity auth) |
| Language toggle | Switch between English ↔ Hebrew |
| Mobile menu | Hamburger menu works on mobile viewport |

---

## Step 11: Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add property: `https://duane-syndrome.com`
3. Verify via DNS TXT record (recommended) or HTML file
4. Submit sitemap: `https://duane-syndrome.com/sitemap.xml`
5. Also add `https://duane.life` if you have that domain

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/duane-syndrome-portal.git
cd duane-syndrome-portal

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local
# Edit .env.local with your actual values

# Push DB schema (first time only)
npx drizzle-kit push

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby (Free) | $0/month |
| Sanity CMS | Free | $0/month |
| Turso DB | Free (9GB, 500M reads) | $0/month |
| Auth.js | Open source | $0/month |
| Resend | Free (3K emails/mo) | $0/month |
| Gemini AI | Free (1,500 req/day) | $0/month |
| GitHub Actions | Free (public repos) | $0/month |
| Domain | duane-syndrome.com | ~$12/year |
| **Total** | | **~$1/month** |

---

## Ongoing Maintenance

- **Content**: Use Sanity Studio at `/admin` to create/edit blog posts and medical pages
- **Research**: Runs automatically daily via GitHub Actions
- **Submissions**: Check the database or admin for pending submissions
- **Translations**: Edit `messages/en.json` and `messages/he.json` for UI text
- **Deployments**: Push to `main` branch → auto-deploys to Vercel
