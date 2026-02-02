import express from "express";

const app = express();
app.use(express.json());

// ================= KEYS =================
const keys = new Map();

// ================= ADMIN ROUTES =================
app.post("/admin/key/add", (req, res) => {
    const { key } = req.body;
    if (!key) return res.status(400).send("Missing key");

    keys.set(key, { hwid: null, expires: null });
    res.send("OK");
});

app.post("/admin/key/delete", (req, res) => {
    const { key } = req.body;
    if (!keys.has(key)) return res.status(404).send("Not found");

    keys.delete(key);
    res.send("OK");
});

app.get("/admin/key/list", (req, res) => {
    res.json([...keys.entries()]);
});

// ================= ROBLOX AUTH =================
app.get("/v9/auth", (req, res) => {
    const { k, hwid, experienceId } = req.query;

    if (!k || !hwid || !experienceId) {
        return res.status(401).send("AUTH_FAIL");
    }

    if (!keys.has(k)) {
        return res.status(401).send("AUTH_FAIL");
    }

    const data = keys.get(k);

    if (data.hwid === null) {
        data.hwid = hwid;
        keys.set(k, data);
    }

    if (data.hwid !== hwid) {
        return res.status(401).send("AUTH_FAIL");
    }

    return res.status(200).send("");
});

// ================= START =================
const PORT = process.env.PORT || 8080;
app.listen(PORT);
