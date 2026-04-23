require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 📁 تخزين الملفات محليًا
const upload = multer({ dest: "uploads/" });

// 🧠 قاعدة بيانات مؤقتة (تقدر تبدلها بMongoDB لاحقًا)
let db = {};

/* =========================
   🔐 API KEY CHECK MIDDLEWARE
========================= */
function checkKey(req, res, next) {
    const key = req.headers["x-api-key"];

    if (!key || key !== process.env.API_KEY) {
        return res.status(403).json({ error: "Forbidden - Invalid API Key" });
    }

    next();
}

/* =========================
   📤 UPLOAD FILE
========================= */
app.post("/upload", checkKey, upload.single("file"), (req, res) => {
    try {
        const id = "SA-" + Math.floor(Math.random() * 9999);

        db[id] = {
            path: req.file.path,
            created: Date.now()
        };

        res.json({ id });
    } catch (e) {
        res.status(500).json({ error: "Upload failed" });
    }
});

/* =========================
   📥 GET FILE
========================= */
app.get("/get", checkKey, (req, res) => {
    const id = req.query.id;

    if (!db[id]) {
        return res.status(404).send("Not found");
    }

    const file = fs.readFileSync(db[id].path);
    res.send(file);
});

/* =========================
   🧹 DELETE FILE (OPTIONAL)
========================= */
app.delete("/delete", checkKey, (req, res) => {
    const id = req.query.id;

    if (!db[id]) {
        return res.status(404).json({ error: "Not found" });
    }

    fs.unlinkSync(db[id].path);
    delete db[id];

    res.json({ success: true });
});

/* =========================
   🚀 START SERVER
========================= */
app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
