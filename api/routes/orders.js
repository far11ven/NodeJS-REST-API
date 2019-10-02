const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/auth");
const OrdersController = require("../controllers/orderController");

router.get("/", checkAuth, OrdersController.get_all_orders);

router.get("/:orderId", checkAuth, OrdersController.get_order_by_id);

router.post("/", checkAuth, OrdersController.create_an_order);

router.delete("/:orderId", checkAuth, OrdersController.delete_order_by_id);

module.exports = router;
