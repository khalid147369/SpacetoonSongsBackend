const express = require("express");
const router = express.Router();
const songController = require("../controllers/songController");
const upload = require("../middleware/upload");

router.get("/", songController.getAllSongs);
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  songController.createSong
);
router.get("/:id", songController.getSongById);

module.exports = router;
