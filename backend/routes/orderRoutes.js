const express = require("express");
const router = express.Router();

const Order = require("../models/Order");

// ➤ CREATE ORDER
router.post("/order", async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();

        res.json({
            message: "Order placed successfully 🎉"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ➤ GET ALL ORDERS (ADMIN)
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

