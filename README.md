# GSBS Tutor Skill Lab

Practical section of GSBS Tutor. Five hands-on vocational labs — Web Design, Coding,
Graphic Design, Marketing and Finance. Runs fully offline after first load (PWA).

Each lab now has four tabs: **Introduction**, **Step-by-Step Guide**, **Examples**, and
**Weekly Tasks** (a 12-week, auto-graded, tickable curriculum). Content is grade-appropriate —
primary and secondary students see different wording, examples, and tasks for the same skill.

---

## What changed in this update

1. **Content restructure** — each skill's tabs were Principle / Career / Earnings / Challenge.
   They are now:
   - **Introduction** — what the skill is, plus career & earning opportunities (folded in).
   - **Step-by-Step Guide** — the rules/principles as a numbered, beginner-friendly guide.
   - **Examples** — 5 worked examples per skill per grade level (50 total), each a mini
     walkthrough: goal → steps → code/approach → mock outcome.
   - **Weekly Tasks** — 12 independent weekly tasks per skill per grade level (120 total).
     Each task shows on the student's dashboard with a tick once completed. Grading is
     instant and client-side, with a success message or a correction shown immediately.
   All content lives in the `SKILL_CONTENT` constant near the top of the main `<script>`
   block in `index.html`.

2. **Fixed: "Validate" / "Run My Code" buttons not responding.**
   Root cause — the functions that attach click handlers to the practice workspace
   (`secWebWire`, `priCodeWire`, etc.) were defined but never called; `renderLab()` only
   injected the workspace HTML and never wired up its events. `renderLab()` now calls the
   matching `*Wire()` function immediately after injecting the workspace markup.

3. **Fixed: API routes could be shadowed by the catch-all rewrite.**
   `vercel.json`'s rewrites previously listed explicit `/api/*` rules *and* a catch-all
   `/(.*) → /index.html` rule in the same array — on some Vercel routing resolutions the
   catch-all can take effect for `/api/save`, `/api/work`, etc., causing "My Work" /
   leaderboard / save to silently fail. The catch-all now explicitly excludes `api/`,
   `icons/`, `manifest.json`, `sw.js`, and `index.html` via a negative-lookahead pattern,
   and the redundant explicit `/api/*` rewrites (Vercel already maps `api/*.js` to
   functions automatically) were removed.

4. **Fixed: hardcoded preview domain.** The manifest and apple-touch-icon `<link>` tags
   pointed at a specific `tutorlab-psi.vercel.app` preview URL. They're now relative
   (`/manifest.json`, `/icons/icon-192.png`), so they work on whatever domain you deploy to.

5. **Shrunk the home screen for mobile.** The top bar + welcome banner used to take
   up the entire first screen on a phone (≈700px of hero before any lesson content),
   so the lab pills and Practice Lab were invisible until the student scrolled. Both
   are now compact single-row banners: stat pills wrap onto a second line instead of
   overflowing, the long title/greeting hide in favour of just a small mascot icon on
   narrow screens (the full title still shows on tablet/desktop), and a few responsive
   utility classes were hand-written into the inline stylesheet as a safety net so the
   layout is correct even on the rare load where the Tailwind CDN script is slow. The
   home screen is still there — it just no longer pushes the actual lesson out of view.

6. **Compacted the achievements strip.** All 9 badges used to render as a permanent
   horizontal row on every page load, mostly greyed-out for new students — visual
   noise before they'd earned anything. It's now a single compact line ("2/9 badges ·
   Speed Run") that expands into the full row only when tapped. The badges still exist
   and unlock exactly as before; they just don't take up space until a student wants
   to look at them.

7. **Enlarged the practice editors.** The code editor (used by Web Design and Coding)
   was a fixed 6-row textarea — about 144px tall — which felt cramped once a student
   wrote more than 2-3 lines, especially on desktop where the surrounding card had
   plenty of unused space. It's now 260px on mobile and 340px on desktop/laptop. The
   Marketing ad-copy textarea was similarly bumped from 5 to 8 rows. Graphic Design and
   Finance don't use a free-text editor (colour pickers and number fields instead), so
   they're unaffected.

8. **Replaced stark white with a warm cream palette.** Every page background, lesson
   card, practice card, badge pill, and dashboard surface was pure white (#ffffff),
   which is harsh to stare at for a 12-week study habit. The page background is now a
   soft cream (#f7f3ec) and cards sit on a slightly lighter warm off-white (#fffcf6),
   so cards still visibly lift off the page. Borders and body text were shifted from
   cool slate-grey to warm stone tones to match. Contrast was checked against WCAG: card
   text is 17:1 (titles) and 7.4:1 (body), both well past the AAA minimum. The colourful
   gradient header/hero and each skill's accent colour (blue/purple/pink/orange/green)
   are unchanged — only the flat white surfaces were warmed up.

9. **Fixed a major hidden bug: most of the Practice Lab silently depended on the
   Tailwind CDN script loading successfully.** Auditing every CSS class actually used in
   the file turned up 222 classes — including basics like `w-full`, `grid`, `block`,
   and the entire two-column desktop layout (`lg:grid-cols-2`) — that only existed if
   `cdn.tailwindcss.com` loaded in time. If that script was slow, blocked by a school
   network/firewall, or briefly down, editors and live-preview boxes silently collapsed
   to browser default sizes (a 300x150px iframe, a 16px-tall flyer box, a 157px-wide
   editor) and the two-column layout fell apart into a degraded single column. All 222
   classes now have a hand-generated, mechanically verified static CSS rule embedded
   directly in the page, so the layout renders correctly with zero dependency on any
   external network request — confirmed by re-running the whole test suite with the
   CDN script blocked.

10. **Genuinely enlarged every practice/preview surface**, now that they render at their
    correct size reliably: the Web Design live-preview iframe (96px → 160px primary,
    144px → 192px secondary), the Coding output console (70px → 128px) and primary
    drag-drop sequence area (52px → 80px), the Graphic Design flyer mockup (96px → 160px
    primary, 144px → 192px secondary), and the Marketing phone-screen mockup (56px →
    96px, frame widened 200px → 240px). The code editor and Marketing textarea were
    already enlarged in an earlier pass (see #7). Finance's number inputs and readout
    table were left as-is — they're single-line fields that were already correctly
    sized, not collapsed preview boxes.

11. **Enlarged the header mascot and title.** The 🤖 + "GSBS Tutor Skill Lab" in the top
    bar went from text-3xl/text-sm to text-4xl/text-base on desktop (30px → 36px mascot,
    14px → 16px title), and the mobile-only mascot from text-2xl to text-3xl (24px →
    30px). Still fits cleanly alongside the stat pills with no overflow.

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

Note: the 12-week task tick state is **not** stored via these endpoints — it's tracked
client-side in `localStorage` (per device/browser) so it works fully offline. The
`/api/save` endpoint is still used for the Practice Lab challenge on the right-hand side
of each skill page (the "💾 Save to My Dashboard" button).

## Content structure (`SKILL_CONTENT`)

Each of the 5 entries in `SKILL_CONTENT` (one per skill) has this shape:

```js
{
  id, emoji, name, tag, accent, accentDark, accentSoft,   // display metadata
  intro:   { primary: "...", secondary: "..." },          // what + career/earnings
  guide:   { primary: [...5 steps], secondary: [...5 steps] },
  examples:{ primary: [...5 examples], secondary: [...5 examples] },
  tasks:   { primary: [...12 weekly tasks], secondary: [...12 weekly tasks] }
}
```

Each weekly task has a `kind` field that maps to a grading function in `gradeTask()` —
see the "WEEKLY TASK ENGINE" section in `index.html` for the full list of supported kinds
(keyword/tag checks, loop-pattern checks, numeric budget checks, contrast-ratio checks,
hook-word/sentence checks, etc.) and `taskInputHTML()` for the matching input UI.

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
