import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

// ================= CONFIG =================
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ================= KEYS =================
// Each key can have its own expiration; hwid null = first use
const keys = {
  "1f5531ecdc71b76979960fb624e81154": { hwid: null, expires: new Date("2026-02-25T00:00:00Z") },
  "TESTKEY-2025": { hwid: null, expires: new Date("2025-01-01T00:00:00Z") },
  "LIFETIME-KEY-001": { hwid: null, expires: null } // null = no expiry
};

// ================= HELPERS =================
function unauthorized(res, reason = "Unauthorized!") {
  console.log("AUTH FAIL:", reason);
  return res.status(200).send(reason);
}

// ================= AUTH ROUTE =================
app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid, experienceId } = req.query;

  console.log("==== AUTH ATTEMPT ====");
  console.log({ key: k, hwid, experienceId, time: new Date() });

  if (secret !== SECRET_KEY) return unauthorized(res, "Invalid secret key");
  if (!k || !keys[k]) return unauthorized(res, "Key not found");
  if (!hwid) return unauthorized(res, "HWID missing");
  if (!experienceId) return unauthorized(res, "ExperienceId missing");

  const keyData = keys[k];

  // ================= EXPIRATION CHECK =================
  if (keyData.expires && new Date() > keyData.expires) return unauthorized(res, "Key expired");

  // ================= HWID LOCK =================
  if (!keyData.hwid) {
    keyData.hwid = hwid;
    console.log(`HWID locked for key ${k}: ${hwid}`);
  } else if (keyData.hwid !== hwid) {
    return unauthorized(res, `HWID mismatch. Expected ${keyData.hwid}, got ${hwid}`);
  }

  // ================= SUCCESS =================
  console.log(`AUTH SUCCESS: key ${k} for HWID ${hwid}`);
  return res.status(200).send(""); // empty string = success
});

// ================= HWID RESET (for testing) =================
app.get("/reset-hwid", (req, res) => {
  const { k, secret } = req.query;
  if (secret !== SECRET_KEY) return res.status(403).send("Forbidden");
  if (!k || !keys[k]) return res.status(404).send("Key not found");

  keys[k].hwid = null;
  console.log(`HWID RESET for key ${k}`);
  return res.status(200).send("HWID reset successfully");
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
