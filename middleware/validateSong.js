module.exports = (req, res, next) => {
  const { title } = req.body;
  if (!title || !title.toString().trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  // multer populates req.files
  if (!req.files || !req.files.image || !req.files.audio) {
    return res
      .status(400)
      .json({ message: "Image and audio files are required" });
  }

  next();
};
