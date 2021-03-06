const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

exports.get_all_orders = (req, res, next) => {
  Order.find()
    .select("productId quantity _id")
    .populate("productId")
    .exec()
    .then(result => {
      res.status(200).json({
        count: result.length,
        message: "GET request for /orders",
        order: result.map(doc => {
          return {
            _id: doc._id,
            productId: doc.productId,
            quantity: doc.quantity
          };
        })
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "GET request for /orders",
        error: err
      });
    });
};

exports.get_order_by_id = (req, res, next) => {
  const id = req.params.orderId;

  Order.findById(id)
    .populate("productId")
    .exec()
    .then(result => {
      if (!result) {
        return res.status(404).json({
          message: "OrderId not found"
        });
      }
      res.status(200).json({
        message: "GET request for /orders/(id}",
        orderDetails: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(404).json({
        message: "OrderId doesn't exist",
        error: err
      });
    });
};

exports.create_an_order = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => {
      console.log("prod ===> ", product);

      if (product) {
        const order = new Order({
          _id: mongoose.Types.ObjectId(),
          productId: req.body.productId,
          quantity: req.body.quantity
        });

        return order.save();
      } else {
        return res.status(404).json({
          message: "ProductId doesn't exist for the order"
        });
      }
    })
    .then(result => {
      res.status(201).json({
        message: "Order was created successfully",
        order: result
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        message: "Order was not created",
        error: err
      });
    });
};

exports.delete_order_by_id = (req, res, next) => {
  const id = req.params.orderId;

  Order.remove({ _id: id })
    .exec()
    .then(result => {
      if (result.deletedCount > 0) {
        res.status(200).json({
          message: "Order was removed"
        });
      } else {
        res.status(200).json({
          message: "No Order was removed, as orderId doesn't exist."
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(404).json({
        message: "OrderId doesn't exist",
        error: err
      });
    });
};
