const multer = require("multer");
const path = require("path");

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "image") {
      cb(null, path.join(__dirname, "..", "uploads", "images"));
    } else if (file.fieldname === "audio") {
      cb(null, path.join(__dirname, "..", "uploads", "audio"));
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    cb(null, file.mimetype.startsWith("image/"));
  } else if (file.fieldname === "audio") {
    cb(null, file.mimetype.startsWith("audio/"));
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Middleware para generar rutas relativas al servidor (web-friendly)
const addWebPath = (req, res, next) => {
  // Subida simple (single)
  if (req.file) {
    if (req.file.fieldname === "image") {
      req.file.webPath = `/uploads/images/${req.file.filename}`;
    } else if (req.file.fieldname === "audio") {
      req.file.webPath = `/uploads/audio/${req.file.filename}`;
    }
  }

  // Subida múltiple (array o fields)
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (file.fieldname === "image") {
          file.webPath = `/uploads/images/${file.filename}`;
        } else if (file.fieldname === "audio") {
          file.webPath = `/uploads/audio/${file.filename}`;
        }
      });
    } else {
      // Si se usan campos con nombres diferentes (fields)
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          if (file.fieldname === "image") {
            file.webPath = `/uploads/images/${file.filename}`;
          } else if (file.fieldname === "audio") {
            file.webPath = `/uploads/audio/${file.filename}`;
          }
        });
      });
    }
  }

  next();
};

module.exports = { upload, addWebPath };
