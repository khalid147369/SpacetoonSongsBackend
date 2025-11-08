const express = require("express");
const router = express.Router();
const songController = require("../controllers/songController");
const { upload,addWebPath} = require("../middleware/upload");
const auth = require("../middleware/auth");
const validateSong = require("../middleware/validateSong");

router.get("/", songController.getAllSongs);
router.post(
  "/",
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  addWebPath,
  validateSong,
  songController.createSong
);
router.get("/:id", songController.getSongById);

module.exports = router;
