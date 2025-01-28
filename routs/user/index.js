const { Router } = require("express");
const route = Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

route.get("/users", async (req, res, next) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

route.get("/users/:id", async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await prisma.user.findUnique({
            where: { id }
        });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

route.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (user) {
            if (user.password === password) {
                const token = jwt.sign({ userid: user.id }, process.env.JWT_SECRET_WEB_TOKEN);
                return res.status(200).json({
                    user,
                    token,
                    message: "Login successful"
                });
            } else {
                return res.status(401).json({ message: "Invalid password" });
            }
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

route.post("/register", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await prisma.user.findUnique({
            where: { email }
        })
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password
            }
        });
        const token = jwt.sign({ userid: user.id  }, process.env.JWT_SECRET_WEB_TOKEN);
        return res.status(200).json({
            user,
            token,
            message: "Registration successful"
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});





module.exports = route;