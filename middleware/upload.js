const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// ------------------------------
// 1. Configuración de Multer en memoria
// ------------------------------
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    cb(null, file.mimetype.startsWith("image/"));
  } else if (file.fieldname === "audio") {
    cb(null, file.mimetype.startsWith("audio/"));
  } else {
    cb(new Error("Tipo de archivo no permitido"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ------------------------------
// 2. Middleware para subir a Cloudinary desde memoria
// ------------------------------
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (req.file) {
      // Subida single
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: req.file.fieldname === "image" ? "images" : "audio" },
        (error, result) => {
          if (error) return next(error);
          req.file.cloudinaryUrl = result.secure_url;
          next();
        }
      ).end(req.file.buffer);
      return; // Salimos del middleware porque next() se llama dentro del callback
    }

    if (req.files) {
      // Subida multiple / fields
      const promises = [];

      for (const key of Object.keys(req.files)) {
        for (const file of req.files[key]) {
          promises.push(
            new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { resource_type: "auto", folder: file.fieldname === "image" ? "images" : "audio" },
                (error, result) => {
                  if (error) reject(error);
                  file.cloudinaryUrl = result.secure_url;
                  resolve();
                }
              ).end(file.buffer); 
            })
          );
        }
      }

      await Promise.all(promises);
    }

    next();
  } catch (error) {
    console.error("Error Cloudinary:", error);
    res.status(500).json({ error: "Error subiendo archivo a Cloudinary" });
  }
};

module.exports = { upload, uploadToCloudinary };
