const Image = require("../models/image");
const cloudinary = require("../config/cloudinary");



exports.createImage = async (req, res) => {
  try {
    const image = new Image({
      title: req?.body?.title,
      image: req.files["image"][0].cloudinaryUrl,
      position: req?.body?.position,
      type: req.body.type,
      
    });

    const newImage = await image.save();
    res.status(201).json(newImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getImagesByType = async (req, res) => {
  try {
    const images = await Image.find({type : req.params.type}) ;
    if (images) {
      res.json(images);
    } else {
      res.status(404).json({ message: "Images not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /songs/:id
exports.deleteImage = async (req, res) => {
  try {

    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: "image not found" });
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
    if (image.image) {
      const publicIdImage = getPublicId(image.image);
      await cloudinary.uploader.destroy(publicIdImage, { resource_type: "image" });
    }
    
    // Borrar de MongoDB
    await image.deleteOne();

    res.json({ message: "image deleted" });
  } catch (error) {
    console.error("Error borrando image:", error);
    res.status(500).json({ error: "Error while deleting image" });
  }
};


