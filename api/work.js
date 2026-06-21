/**
 * GET /api/work?student_id=Ada
 * Returns all submissions for a student, newest first.
 *
 * Required env vars: SUPABASE_URL, SUPABASE_KEY
 */
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const student_id = req.query.student_id || "anonymous";

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    const { data, error } = await supabase
      .from("lab_submissions")
      .select("id, course, level, lab_id, passed, score, submitted_at")
      .eq("student_id", student_id)
      .order("submitted_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return res.status(200).json({ ok: true, submissions: data });
  } catch (err) {
    console.error("work error:", err);
    return res.status(500).json({ error: "Database error", detail: err.message });
  }
};
