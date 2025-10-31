const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const dir = path.join(__dirname, "..", "..", "uploads", "usuarios");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        const nomeArquivo = `${Date.now()}-${(file.fieldname || "foto")}${ext}`;
        cb(null, nomeArquivo);
    },
});

function fileFilter(req, file, cb) {
    // aceita apenas imagens
    if (!file || !file.mimetype) return cb(null, false);
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Arquivo inválido: envie uma imagem."));
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
