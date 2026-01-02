const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const { uploadToCloudinary,upload} = require("../middleware/upload");
const auth = require("../middleware/auth");
const authorizeRole = require("../middleware/authorizeRole");
const validateSong = require("../middleware/validateSong");

router.get("/:type", imageController.getImagesByType);
router.post(
  "/",
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  uploadToCloudinary,
  authorizeRole("admin"),
  imageController.createImage
);
router.delete("/:id", auth, authorizeRole("admin"), imageController.deleteImage);


module.exports = router;