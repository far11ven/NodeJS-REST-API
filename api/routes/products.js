const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
crypto = require("crypto");
const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: function(req, file, callback) {
//     callback(null, "./uploads/");
//   },
//   filename: function(req, file, callback) {
//     callback(null, file.originalname);
//   }
// });

const GridFsStorage = require("multer-gridfs-storage");

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
        const filename = file.originalname;
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

const Product = require("../../models/product");

router.get("/", (req, res, next) => {
  Product.find()
    .select("-__v") //removes __v from mongo doc
    .exec()
    .then(docs => {
      console.log(docs);

      if (docs.length >= 0) {
        res.status(200).json({
          count: docs.length,
          message: "GET requests for /products",
          createdProducts: docs
        });
      } else {
        res.status(200).json({
          message: "GET requests for /products",
          error: "No Entries Found"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "GET requests for /products",
        error: err
      });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .exec()
    .then(doc => {
      console.log(doc);

      if (doc) {
        res.status(200).json({
          message: "GET requests for /products/{productId}",
          document: doc
        });
      } else {
        res.status(404).json({
          message: "GET requests for /products/{productId}",
          error: "No Doc is present with passed ObjectId"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "GET requests for /products/{productId}",
        error: err
      });
    });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  console.log(" file ==> ", req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: "asd"
  });

  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created Product successfully",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result.id,
          request: {
            type: "GET",
            url: "/api/products/" + result.id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "POST requests for /products",
        error: err
      });
    });
});

router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "UPDATE requests for /products/{productId}",
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "UPDATE requests for /products/{productId}",
        error: err
      });
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;

  Product.remove({ _id: id })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "DELETE requests for /products/{productId}",
        result: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "DELETE requests for /products/{productId}",
        error: err
      });
    });
});

module.exports = router;
