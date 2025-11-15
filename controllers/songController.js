const Song = require("../models/Song");
const cloudinary = require("../config/cloudinary");
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
      image: req.files["image"][0].cloudinaryUrl,
      audio: req.files["audio"][0].cloudinaryUrl,
      
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

// DELETE /songs/:id
exports.deleteSong = async (req, res) => {
  try {

    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: "Song no encontrada" });
    }

    // Extraer public_id de Cloudinary de la URL
    const getPublicId = (url) => {
      // ejemplo: https://res.cloudinary.com/<cloud>/video/upload/v123456/audio/abcd.mp3
      const parts = url.split("/");
      const folderAndFile = parts.slice(-2).join("/"); // "audio/abcd.mp3"
      const publicIdWithExt = folderAndFile.split(".")[0]; // "audio/abcd"
      return publicIdWithExt;
    };

    // Borrar imagen de Cloudinary
    if (song.image) {
      const publicIdImage = getPublicId(song.image);
      await cloudinary.uploader.destroy(publicIdImage, { resource_type: "image" });
    }

    // Borrar audio de Cloudinary
    if (song.audio) {
      const publicIdAudio = getPublicId(song.audio);
      await cloudinary.uploader.destroy(publicIdAudio, { resource_type: "video" }); // los audios usan video
    }

    // Borrar de MongoDB
    await song.deleteOne();

    res.json({ message: "Song y archivos eliminados correctamente" });
  } catch (error) {
    console.error("Error borrando song:", error);
    res.status(500).json({ error: "Error al borrar la song" });
  }
};
