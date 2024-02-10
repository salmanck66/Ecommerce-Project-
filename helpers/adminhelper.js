const util = require('util');
const category = require('../models/category');
const claudinery = require('../utils/cloudinery');
const upload = require('../middleware/multer');
const moment = require('moment');


let categoryAddPost = (categoryName, imagePath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const cloudinaryResult = await cloudinary.uploader.upload(imagePath, { folder: 'categories' });
            console.log("succesfully saved in cloudinary", cloudinaryResult);
            // console.log(cloudinaryResult);
            let data = new Category({
                categoryName: categoryName,
                categoryImage: cloudinaryResult.secure_url,
                imageId: cloudinaryResult.public_id
            });
            await data.save();
            console.log("category added in database");
            //    console.log(data);
            resolve({ success: true, data })
        } catch (error) {
            console.error("error during categoryAddPost HELPER Section", error);
            reject(error);

        }
    })
}

module.exports = {categoryAddPost}