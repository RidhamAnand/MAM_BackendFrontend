const express = require("express");
const Image = require("../model/Image");
const router = express.Router();

router.get("/getImages", async (req, res) => {

    console.log("Fetch Image Request\n");
    

    try {
        // Fetch all images sorted by the creation date in descending order
        const images = await Image.find().sort({ createdAt: -1 }); // Adjust 'createdAt' to your actual date field

        // Map to extract URLs into an array
        const imageUrls = images.map(image => image.url); // Adjust 'url' to your actual URL field

        res.status(200).json({ success: true, images: imageUrls });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
