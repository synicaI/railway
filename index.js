import express from "express";
const app = express();

const PORT = process.env.PORT || 8080;
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

app.use(express.json());

// KEY STORE (memory, same as before)
const keys = {};

// ===== AUTH (ROBLOX) =====
app.get("/v9/auth", (req, res) => {
  const { secret, k, hwid } = req.query;

  if (secret !== SECRET_KEY)
    return res.status(403).send("Invalid secret");

  if (!k || !keys[k])
    return res.status(403).send("Key not found");

  if (!hwid)
    return res.status(403).send("HWID missing");

  const data = keys[k];

  if (!data.hwid) {
    data.hwid = hwid; // FIRST EXEC LOCK
  } else if (data.hwid !== hwid) {
    return res.status(403).send("HWID mismatch");
  }

  return res.status(200).send("");
});

// ===== DISCORD COMMAND ROUTES =====
app.post("/key/add", (req, res) => {
  const { secret, key } = req.body;
  if (secret !== SECRET_KEY) return res.status(403).json({ error: "Forbidden" });

  keys[key] = { hwid: null };
  return res.json({ ok: true });
});

app.post("/key/delete", (req, res) => {
  const { secret, key } = req.body;
  if (secret !== SECRET_KEY) return res.status(403).json({ error: "Forbidden" });

  delete keys[key];
  return res.json({ ok: true });
});

app.post("/key/reset", (req, res) => {
  const { secret, key } = req.body;
  if (secret !== SECRET_KEY) return res.status(403).json({ error: "Forbidden" });

  if (keys[key]) keys[key].hwid = null;
  return res.json({ ok: true });
});

app.get("/key/list", (req, res) => {
  if (req.query.secret !== SECRET_KEY)
    return res.status(403).json({ error: "Forbidden" });

  return res.json(Object.keys(keys));
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});
