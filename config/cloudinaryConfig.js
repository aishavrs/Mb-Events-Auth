const cloudinary = require("cloudinary").v2
const {CloudinaryStorage} = require("multer-storage-cloudinary");
const multer = require("multer")
require("dotenv").config()
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = "event/uploads";
        let resourceType = "auto"

        return{
            folder,
            resource_type: resourceType,
        };
    },

});
const upload = multer({storage});

module.exports = {cloudinary, upload}