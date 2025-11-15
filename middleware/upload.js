const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary"); // <-- Asegúrate de crear este archivo

// ------------------------------
// 1. Configuración de Multer TEMPORAL
// ------------------------------

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

// ------------------------------
// 2. Filtrar archivos válidos
// ------------------------------

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    cb(null, file.mimetype.startsWith("image/"));
  } else if (file.fieldname === "audio") {
    cb(null, file.mimetype.startsWith("audio/"));
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

// ------------------------------
// 3. Multer configurado
// ------------------------------

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ------------------------------
// 4. Middleware para subir a Cloudinary
// ------------------------------

const uploadToCloudinary = async (req, res, next) => {
  try {
    // ------- Single upload -------
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: req.file.fieldname === "image" ? "images" : "audio",
      });

      // Borrar archivo local
      fs.unlinkSync(req.file.path);

      // URL final de Cloudinary
      req.file.cloudinaryUrl = result.secure_url;
    }

    // ------- Multiple files upload -------
    if (req.files) {
      for (const key of Object.keys(req.files)) {
        for (const file of req.files[key]) {
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "auto",
            folder: file.fieldname === "image" ? "images" : "audio",
          });

          // Borrar archivo local
          fs.unlinkSync(file.path);

          // URL final
          file.cloudinaryUrl = result.secure_url;
        }
      }
    }

    next();
  } catch (error) {
    console.error("Error Cloudinary:", error);
    res.status(500).json({ error: "Error subiendo archivo a Cloudinary" });
  }
};

module.exports = { upload, uploadToCloudinary };
