const { Router } = require("express");
const route = Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

route.get("/me", async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN)
        if (decoded) {
            const { userId } = req.body;
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
                const cart = await prisma.cart.findMany({
                    where: { userId }
                })
                res.status(200).json(cart)
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({ message: "Not found" });
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

        const { userId, productId, count = 1 } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const productCart = await prisma.cart.findFirst({
            where: { userId, productId },
        });

        if (productCart) {
            const updatedCart = await prisma.cart.update({
                where: { id: productCart.id }, // استخدم معرف العنصر (id) بدلاً من userId و productId
                data: {
                    count: productCart.count + count,
                },
            });
            return res.status(200).json({ message: "Cart updated successfully", cart: updatedCart });
        }
        const newCart = await prisma.cart.create({
            data: {
                userId,
                productId,
                count,
            },
        });
        res.status(201).json({ message: "Product added to cart", cart: newCart });
    } catch (error) {
        res.status(500).json({ message: error });
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
        const { userId, productId, count = 1 } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const productCart = await prisma.cart.findFirst({
            where: { userId, productId },
        });

        if (!productCart) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        if (productCart.count > count) {
            const updatedCart = await prisma.cart.update({
                where: { id: productCart.id }, // استخدام id لتحديد السجل
                data: {
                    count: productCart.count - count,
                },
            });
            return res.status(200).json({ message: "Cart updated successfully", cart: updatedCart });
        } else {
            await prisma.cart.delete({
                where: { id: productCart.id },
            });
            return res.status(200).json({ message: "Product removed from cart" });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});


module.exports = route; 
