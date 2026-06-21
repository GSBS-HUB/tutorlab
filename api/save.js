/**
 * POST /api/save
 * Saves a student submission to Supabase.
 *
 * Required env vars (set in Vercel dashboard):
 *   SUPABASE_URL  — e.g. https://xxxx.supabase.co
 *   SUPABASE_KEY  — your service_role or anon key
 *
 * Run this SQL once in Supabase SQL Editor to create the table:
 *   CREATE TABLE IF NOT EXISTS lab_submissions (
 *     id           BIGSERIAL PRIMARY KEY,
 *     student_id   TEXT        NOT NULL DEFAULT 'anonymous',
 *     course       TEXT        NOT NULL,
 *     level        TEXT        NOT NULL,
 *     lab_id       TEXT        NOT NULL,
 *     passed       BOOLEAN     NOT NULL DEFAULT false,
 *     answer       TEXT,
 *     score        INTEGER     NOT NULL DEFAULT 0,
 *     submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 */
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { student_id, course, level, lab_id, passed, answer, score } =
    req.body || {};
  if (!course || !level)
    return res.status(400).json({ error: "course and level are required" });

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from("lab_submissions")
      .insert([{
        student_id: student_id || "anonymous",
        course,
        level,
        lab_id: lab_id || course,
        passed: !!passed,
        answer: String(answer || ""),
        score: score || 0,
      }])
      .select("id, submitted_at")
      .single();

    if (error) throw error;
    return res.status(200).json({ ok: true, id: data.id, submitted_at: data.submitted_at });
  } catch (err) {
    console.error("save error:", err);
    return res.status(500).json({ error: "Database error", detail: err.message });
  }
};
