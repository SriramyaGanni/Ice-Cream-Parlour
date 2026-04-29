require("node:dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("node:path");
const mongoose = require("mongoose");

const app = express();

// ================================
// ✅ MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());

// ================================
// ✅ MONGODB CONNECTION (IMPROVED)
// ================================
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in environment variables");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully 🍃"))
    .catch(err => {
        console.error("MongoDB Connection Failed ❌", err);
        process.exit(1);
    });

// ================================
// 📦 ORDER SCHEMA (IMPROVED VALIDATION)
// ================================
const orderSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    icecream: { type: String, required: true },
    scoops: { type: Number, default: 1 },
    quantity: { type: Number, default: 1 },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model("Order", orderSchema);

// ================================
// 📦 ORDER API (IMPROVED ERROR HANDLING)
// ================================
app.post("/api/order", async (req, res) => {
    try {
        const { name, email, phone, address, icecream } = req.body;

        // basic validation (fixes Sonar "reliability issues")
        if (!name || !email || !phone || !address || !icecream) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const newOrder = new Order(req.body);
        await newOrder.save();

        console.log("✅ Order saved:", newOrder._id);

        return res.status(201).json({
            message: "Order placed successfully"
        });

    } catch (error) {
        console.error("Order API Error:", error);
        return res.status(500).json({
            error: "Failed to save order"
        });
    }
});

// ================================
// 📩 CONTACT SCHEMA (IMPROVED)
// ================================
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contact = mongoose.model("Contact", contactSchema);

// ================================
// 📩 CONTACT API (IMPROVED)
// ================================
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        const newContact = new Contact(req.body);
        await newContact.save();

        console.log("📩 Contact saved:", newContact._id);

        return res.status(201).json({
            message: "Message sent successfully"
        });

    } catch (error) {
        console.error("Contact API Error:", error);
        return res.status(500).json({
            error: "Failed to save message"
        });
    }
});

// ================================
// 📊 GET ALL ORDERS
// ================================
app.get("/api/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return res.json(orders);
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        return res.status(500).json({
            error: "Failed to fetch orders"
        });
    }
});

// ================================
// 🌐 SERVE FRONTEND
// ================================
app.use(express.static(path.join(__dirname, "../frontend")));

// ================================
// 🚀 START SERVER (IMPROVED)
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
