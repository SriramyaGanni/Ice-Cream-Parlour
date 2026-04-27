require('dns').setDefaultResultOrder('ipv4first');
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// ================================
// ✅ MIDDLEWARE
// ================================
app.use(cors());
app.use(express.json());

// ================================
// ✅ MONGODB CONNECTION
// ================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully 🍃"))
    .catch(err => console.log("MongoDB Connection Failed ❌", err));


// ================================
// 📦 ORDER SCHEMA
// ================================
const orderSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    icecream: String,
    scoops: Number,      // ✅ added
    quantity: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model("Order", orderSchema);


// ================================
// 📦 ORDER API
// ================================
app.post("/api/order", async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();

        console.log("✅ Order saved:", newOrder);

        res.status(200).json({ message: "Order placed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save order" });
    }
});


// ================================
// 📩 CONTACT SCHEMA
// ================================
const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Contact = mongoose.model("Contact", contactSchema);


// ================================
// 📩 CONTACT API
// ================================
app.post("/api/contact", async (req, res) => {
    try {
        const newContact = new Contact(req.body);
        await newContact.save();

        console.log("📩 Contact saved:", newContact);

        res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save message" });
    }
});


// ================================
// 📊 GET ALL ORDERS (for dashboard)
// ================================
app.get("/api/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});


// ================================
// 🌐 SERVE FRONTEND
// ================================
app.use(express.static(path.join(__dirname, "../frontend")));


// ================================
// 🚀 START SERVER
// ================================
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});