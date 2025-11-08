const Song = require("../models/Song");

exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSong = async (req, res) => {
  try {
    const song = new Song({
      title: req.body.title,
      image: req.files["image"][0].webPath,
      audio: req.files["audio"][0].webPath,
      
    });

    const newSong = await song.save();
    res.status(201).json(newSong);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (song) {
      res.json(song);
    } else {
      res.status(404).json({ message: "Song not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
