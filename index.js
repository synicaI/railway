import express from "express";
const app = express();

// ================= CONFIG =================
const PORT = process.env.PORT || 8080;
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ================= KEYS =================
const keys = {
  // Existing
  "1f5531ecdc71b76979960fb624e81154": { hwid: null, expires: new Date("2026-02-25T00:00:00Z") },

  // New HARD lifetime keys
  "a9c3f72b5e4d8190f1c7b2e3d6a98c41": { hwid: null, expires: null },
  "e4b91d2a7f0c8a6b3d5e9f421c7a8b90": { hwid: null, expires: null },
  "7d2f8b1e9c34a6f5e0a1b7c9d8e42f6a": { hwid: null, expires: null },
  "c8e1f3b29a4d6c7e5f9b0a8d21e4f6a7": { hwid: null, expires: null },
  "5b7d1a6e9f4c8b2d0e3a1c9f6e7d842a": { hwid: null, expires: null },
  "f6a0e2d7b9c3a1e8d4f5b7c69a821e0d": { hwid: null, expires: null },
  "9d8a7c6f2e3b1a5d0c4f9e8b7a6e1c2d": { hwid: null, expires: null },
  "2c4e7f8a9d1b3e5c6a0f7d82b9e14a6f": { hwid: null, expires: null },
  "b3e8a9f2d1c7e5f4a6b0d98c2a7e14f5": { hwid: null, expires: null },
  "0f7e2a8b9c5d1e4a6f3b7d98c21e5a64": { hwid: null, expires: null },
  "x972jsdjdinsdvbdozopnksd92ejd919": { hwid: null, expires: null }
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

  if (keyData.expires && new Date() > keyData.expires) return unauthorized(res, "Key expired");

  if (!keyData.hwid) {
    keyData.hwid = hwid;
    console.log(`HWID locked for key ${k}: ${hwid}`);
  } else if (keyData.hwid !== hwid) {
    return unauthorized(res, `HWID mismatch. Expected ${keyData.hwid}, got ${hwid}`);
  }

  console.log(`AUTH SUCCESS: key ${k} for HWID ${hwid}`);
  return res.status(200).send(""); // empty string = success
});

// ================= HWID RESET =================
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
