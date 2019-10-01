const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  productImage: {
    file_id: mongoose.Schema.Types.ObjectId,
    url: { type: String, required: true }
  }
});

module.exports = mongoose.model("Product", productSchema);
