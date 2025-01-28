const { Router } = require("express");
const route = Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
route.get("/", async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: "Authorization token missing" });
        }
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const orders = await prisma.order.findMany()
        return res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

route.get("/me", async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: "Authorization token missing" });
        }
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const orders = await prisma.order.findMany({
            where: { userId }
        })
        return res.status(200).json(orders)
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

route.post("/add", async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: "Authorization token missing" });
        }

        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const { userId, productId, total, quantity } = req.body;
        if (!userId || !productId || !total || !quantity) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (total <= 0 || quantity <= 0) {
            return res.status(400).json({ message: "Total and quantity must be greater than zero" });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const order = await prisma.order.create({
            data: {
                userId: userId,
                productId: productId,
                total: total,
                quantity: quantity
            }
        });
        return res.status(201).json({
            message: "Order created successfully",
            order: order
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

route.delete("/delete", async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: "Authorization token missing" });
        }
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const order = await prisma.order.findFirst({
            where: {
                userId: userId,
                productId: productId,
            },
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        await prisma.order.delete({
            where: { id: order.id },
        });
        return res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
});


module.exports = route