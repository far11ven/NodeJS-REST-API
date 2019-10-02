const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const Product = require("../models/product");

exports.get_all_products = (req, res, next) => {
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
};

exports.get_product_by_id = (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .exec()
    .then(doc => {
      console.log(doc);

      if (doc) {
        res.status(200).json({
          message: "GET requests for /products/" + id,
          document: doc
        });
      } else {
        res.status(404).json({
          message: "GET requests for /products/" + id,
          error: "No Doc is present with passed ObjectId"
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "GET requests for /products/" + id,
        error: err
      });
    });
};

exports.get_product_image_by_id = (req, res, next) => {
  try {
    const id = req.params.productId;

    Product.findOne({ _id: id })
      .exec()
      .then(doc => {
        console.log("doc >>> ", doc);

        const imageFileId = doc.productImage.file_id;

        if (doc) {
          let gfs;
          const conn = mongoose.createConnection(process.env.MONGO_URI);
          conn.once("open", () => {
            gfs = Grid(conn.db, mongoose.mongo);

            gfs.collection("uploads");
            console.log("imageFileId >>>" + imageFileId);

            gfs.files.findOne(
              { _id: mongoose.Types.ObjectId(imageFileId) },
              (err, file) => {
                // Check if file
                if (!file || file.length === 0) {
                  return res.status(404).json({
                    err: "No file exists"
                  });
                }

                // Check if its an image
                if (
                  file.contentType === "image/jpeg" ||
                  file.contentType === "image/png"
                ) {
                  // Read output to browser
                  const readstream = gfs.createReadStream(file.filename);
                  readstream.pipe(res);
                } else {
                  res.status(404).json({
                    err: "Not an image"
                  });
                }
              }
            );
          });
        } else {
          res.status(404).json({
            error: "No product present with ObjectId : " + id
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          message:
            "Not able to get 'productImage.file_id' from product with" + id,
          error: err
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "GET requests for /products",
      error: err
    });
  }
};

exports.create_a_product = (req, res, next) => {
  console.log(" file ==> ", req.file);

  const productId = new mongoose.Types.ObjectId();

  const productImageObj = {
    file_id: mongoose.Types.ObjectId(req.file.id),
    url: "/api/products/" + productId + "/image"
  };

  const product = new Product({
    _id: productId,
    name: req.body.name,
    price: req.body.price,
    productImage: productImageObj
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
          productImage: {
            file_id: result.productImage.file_id,
            url: result.productImage.url
          },
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
};

exports.update_a_product_by_id = (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const [index, item] of req.body.entries()) {
    //.entries() provides index in for-of loop
    if (item.propName && item.propValue) {
      updateOps[item.propName] = item.propValue;
    } else {
      res.status(400).json({
        message:
          "'propName' or 'propValue' fields are missing for record " +
          (index + 1)
      });
    }
  }
  console.log("updateOps ==>", updateOps);
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      if (result.nModified > 0) {
        res.status(200).json({
          message: "UPDATE requests for /products/" + id,
          result: result
        });
      } else {
        res.status(200).json({
          message: "No fields updated for /products/" + id
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "UPDATE requests for /products/" + id,
        error: err
      });
    });
};

exports.delete_product_by_id = (req, res, next) => {
  const id = req.params.productId;

  Product.remove({ _id: id })
    .exec()
    .then(result => {
      console.log(result);
      if (result.deletedCount > 0) {
        res.status(200).json({
          message: "Product was removed"
        });
      } else {
        res.status(200).json({
          message: "No Product was removed, as productId doesn't exist."
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "DELETE requests for /products/" + id,
        error: err
      });
    });
};
