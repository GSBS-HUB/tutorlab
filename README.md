# GSBS Tutor Skill Lab

Practical section of GSBS Tutor. Five hands-on vocational labs — Web Design, Coding,
Graphic Design, Marketing and Finance. Runs fully offline after first load (PWA).

---

## Fix for Vercel framework error

If you see:
> "Project framework is set to 'services', but no services are declared."

Go to: **Vercel Dashboard → Your Project → Settings → General → Framework Preset**
Change it to: **Other** (not Services, not Next.js)

The vercel.json in this repo sets `"framework": null` which overrides this, but the
dashboard setting must also be "Other" for the build to succeed.

---

## Deploy steps

### 1 — Create Supabase project
1. Go to https://supabase.com → New project → name it `gsbs-skill-lab`
2. Settings → API → copy **Project URL** and **service_role key**
3. SQL Editor → run this once:

```sql
CREATE TABLE IF NOT EXISTS lab_submissions (
  id           BIGSERIAL PRIMARY KEY,
  student_id   TEXT        NOT NULL DEFAULT 'anonymous',
  course       TEXT        NOT NULL,
  level        TEXT        NOT NULL,
  lab_id       TEXT        NOT NULL,
  passed       BOOLEAN     NOT NULL DEFAULT false,
  answer       TEXT,
  score        INTEGER     NOT NULL DEFAULT 0,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2 — Set environment variables in Vercel

Go to: Vercel Dashboard → Project → Settings → Environment Variables

| Key            | Value                          | Required |
|----------------|-------------------------------|----------|
| SUPABASE_URL   | https://xxxx.supabase.co      | ✅ Yes   |
| SUPABASE_KEY   | your service_role key         | ✅ Yes   |
| GATE_SECRET    | any long random string        | ✅ Yes (for signed tokens) |

Generate a good GATE_SECRET: open your terminal and run:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3 — Deploy
Upload this folder to Vercel (drag and drop, or connect GitHub repo).

### 4 — Generate student links from your GSBS Tutor dashboard

Install jsonwebtoken on your dashboard server:
```
npm install jsonwebtoken
```

Generate a signed link when a student clicks "Go to Lab":
```js
const jwt = require('jsonwebtoken')

const token = jwt.sign(
  {
    name:   "Ada",        // student name
    course: "web",        // web | code | design | social | finance
    level:  "secondary"  // primary | secondary
  },
  process.env.GATE_SECRET,  // same value as Vercel env var
  { expiresIn: "4h" }       // session lasts 4 hours
)

// Redirect student to the lab
res.redirect(`https://lab.gsbsgroup.com/?token=${token}`)
```

The lab verifies the token, extracts name/course/level, and boots automatically.
Expired or tampered tokens show a friendly "Session Expired — return to dashboard" message.

---

## How the access gate works

```
Student logs into dashboard
         ↓
Dashboard generates JWT (signed with GATE_SECRET, expires in 4h)
         ↓
Student redirected to:  lab.vercel.app/?token=eyJhbGci...
         ↓
Lab calls /api/verify?token=...
         ↓
   Valid? → Boot the lab with name/course/level from token
   Expired? → "Session expired" screen with link back to dashboard
   Invalid? → "Access denied" screen
   /api/verify unreachable? → Fall back to HTTP referrer check
```

## Fallback behaviour (backwards compatible)

If `GATE_SECRET` is not set, or `/api/verify` is unreachable, the gate falls back to
checking the HTTP referrer (did they come from tutor.gsbsgroup.com?). This means the
lab continues working during initial setup before tokens are wired up.

---

## API endpoints

| Method | Path              | What it does                        |
|--------|------------------|--------------------------------------|
| GET    | /api/verify      | Verify a signed JWT token            |
| POST   | /api/save        | Save a submission to Supabase        |
| GET    | /api/work        | Fetch a student's saved submissions  |
| GET    | /api/leaderboard | Top 20 students by score             |

## File structure
```
index.html          ← full PWA app (Tailwind CDN, vanilla JS)
sw.js               ← Service Worker (offline caching)
manifest.json       ← PWA manifest (installable, home screen)
icons/
  icon-192.png      ← PWA icon
  icon-512.png      ← PWA icon (large)
api/
  verify.js         ← JWT verification
  save.js           ← Supabase write
  work.js           ← Supabase read (student history)
  leaderboard.js    ← Supabase read (top scores)
vercel.json         ← routing + CORS + framework: null
package.json        ← @supabase/supabase-js + jsonwebtoken
README.md           ← this file
```
