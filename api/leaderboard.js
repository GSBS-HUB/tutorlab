/**
 * GET /api/leaderboard
 * Returns top 20 students by total score from Supabase.
 * Required env vars: SUPABASE_URL, SUPABASE_KEY
 */
const { createClient } = require("@supabase/supabase-js");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await supabase
      .from("lab_submissions")
      .select("student_id, score, passed")
      .eq("passed", true);
    if (error) throw error;
    // aggregate per student
    const map = {};
    data.forEach(r => {
      if (!map[r.student_id]) map[r.student_id] = { student_id: r.student_id, total_score: 0, labs_passed: 0 };
      map[r.student_id].total_score += r.score;
      map[r.student_id].labs_passed += 1;
    });
    const rows = Object.values(map).sort((a, b) => b.total_score - a.total_score).slice(0, 20);
    return res.status(200).json({ ok: true, rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
