/**
 * GET /api/verify?token=<jwt>
 *
 * Verifies a signed JWT issued by the GSBS Tutor dashboard.
 * Returns { ok, name, course, level } on success.
 * Returns { ok: false, error } on failure.
 *
 * Required env var (set in Vercel + on your dashboard server):
 *   GATE_SECRET  — any long random string, same on both servers
 *
 * HOW TO GENERATE A TOKEN ON YOUR GSBS TUTOR DASHBOARD:
 * -------------------------------------------------------
 * npm install jsonwebtoken   (on your dashboard server)
 *
 * const jwt = require('jsonwebtoken')
 * const token = jwt.sign(
 *   { name: "Ada", course: "web", level: "secondary" },
 *   process.env.GATE_SECRET,
 *   { expiresIn: "4h" }
 * )
 * // redirect student to:
 * res.redirect(`https://lab.gsbsgroup.com/?token=${token}`)
 */

const jwt = require("jsonwebtoken");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const token = req.query.token || (req.headers.authorization || "").replace("Bearer ", "");

  if (!token) {
    return res.status(400).json({ ok: false, error: "No token provided" });
  }

  const secret = process.env.GATE_SECRET;
  if (!secret) {
    // GATE_SECRET not set — fail open so the lab still works during setup
    console.warn("[verify] GATE_SECRET not set — token check skipped");
    return res.status(200).json({ ok: true, warn: "no_secret", name: "", course: "", level: "" });
  }

  try {
    const payload = jwt.verify(token, secret);
    return res.status(200).json({
      ok: true,
      name:   payload.name   || "",
      course: payload.course || "",
      level:  payload.level  || ""
    });
  } catch (err) {
    const expired = err.name === "TokenExpiredError";
    return res.status(401).json({
      ok: false,
      expired,
      error: expired ? "Your session has expired. Please return to your dashboard to re-enter the lab." : "Invalid access token."
    });
  }
};
