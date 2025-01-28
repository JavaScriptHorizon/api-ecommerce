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
        const addresses = await prisma.address.findMany();
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: error });
    }
})

route.get("/:id", async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json({ message: "Authorization token missing" });
        }

        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const id = req.params.id;
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = await prisma.address.findUnique({
            where: {
            user
        }});
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: error });
    }
})







module.exports = route;