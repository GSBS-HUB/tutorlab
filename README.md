# GSBS Tutor Skill Lab

Practical section of GSBS Tutor — five vocational skill labs for Nigerian students.

## Deploy to Vercel in 3 steps

### Step 1 — Create a Supabase project
1. Go to https://supabase.com and sign in (free)
2. Click **New project**, name it `gsbs-skill-lab`
3. In the Supabase dashboard: **Settings → API** → copy:
   - **Project URL** (looks like https://xxxx.supabase.co)
   - **service_role** key (under Project API keys)
4. In the dashboard: **SQL Editor** → run this once:

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

### Step 2 — Deploy to Vercel
1. Go to https://vercel.com → **Add New Project** → upload this zip
2. In **Environment Variables**, add:
   - `SUPABASE_URL`  = your Project URL
   - `SUPABASE_KEY`  = your service_role key
3. Click **Deploy**

### Step 3 — Link students from the GSBS Tutor dashboard
```
https://your-lab.vercel.app/?course=web&name=Ada
```
Available course values: `web`, `code`, `design`, `social`, `finance`

## API Endpoints

| Method | Path       | What it does                        |
|--------|-----------|--------------------------------------|
| POST   | /api/save | Save a submission to Supabase        |
| GET    | /api/work | Fetch all submissions for a student  |

## File structure
```
index.html        ← single-file app
api/
  save.js         ← POST endpoint
  work.js         ← GET endpoint
vercel.json       ← routing + CORS
package.json      ← @supabase/supabase-js
README.md         ← this file
```
