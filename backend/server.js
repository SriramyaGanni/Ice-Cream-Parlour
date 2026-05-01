require("node:dns").setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const path = require("node:path");
const fs = require("node:fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load env from backend/.env first; fallback to project root .env
const envCandidates = [
    path.join(__dirname, ".env"),
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "..", ".env")
];

for (const envPath of envCandidates) {
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        break;
    }
}

let isMongoConnected = false;
const fallbackOrders = [];
const fallbackContacts = [];

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
    .then(() => {
        isMongoConnected = true;
        console.log("MongoDB Connected Successfully 🍃");
    })
    .catch(err => {
        console.error("MongoDB Connection Failed ❌", err);
        console.warn("⚠️ Running in fallback mode (in-memory storage)");
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

        let savedOrder;
        if (isMongoConnected) {
            const newOrder = new Order(req.body);
            savedOrder = await newOrder.save();
        } else {
            savedOrder = {
                _id: new mongoose.Types.ObjectId(),
                ...req.body,
                createdAt: new Date()
            };
            fallbackOrders.push(savedOrder);
        }

        console.log("✅ Order saved:", savedOrder._id);

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

        let savedContact;
        if (isMongoConnected) {
            const newContact = new Contact(req.body);
            savedContact = await newContact.save();
        } else {
            savedContact = {
                _id: new mongoose.Types.ObjectId(),
                ...req.body,
                createdAt: new Date()
            };
            fallbackContacts.push(savedContact);
        }

        console.log("📩 Contact saved:", savedContact._id);

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
        const orders = isMongoConnected
            ? await Order.find().sort({ createdAt: -1 })
            : [...fallbackOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
