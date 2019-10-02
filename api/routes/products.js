const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const crypto = require("crypto");

const multer = require("multer");

const ProductController = require("../controllers/productController");
const GridFsStorage = require("multer-gridfs-storage");
//simple implementation
// const storage = multer.diskStorage({
//   destination: function(req, file, callback) {
//     callback(null, "./uploads/");
//   },
//   filename: function(req, file, callback) {
//     callback(null, file.originalname);
//   }
// });
const checkAuth = require("../middleware/auth");
const currTimestamp = Date.now();
const connection = mongoose.connect(
  "mongodb+srv://" +
    process.env.MONGO_USER +
    ":" +
    process.env.MONGO_USER_PASSWORD +
    "@cluster0-n1cyt.gcp.mongodb.net/" +
    process.env.MONGO_DB +
    "?retryWrites=true",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

const storage = new GridFsStorage({
  db: connection,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = file.originalname + "_" + currTimestamp;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback(new Error("productImage is not a valid file type"), true);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/", ProductController.get_all_products);

router.get("/:productId", ProductController.get_product_by_id);

router.get("/:productId/image", ProductController.get_product_image_by_id);

router.post(
  "/",
  checkAuth,
  upload.single("productImage"),
  ProductController.create_a_product
);

router.patch(
  "/:productId",
  checkAuth,
  ProductController.update_a_product_by_id
);

router.delete("/:productId", checkAuth, ProductController.delete_product_by_id);
module.exports = router;
