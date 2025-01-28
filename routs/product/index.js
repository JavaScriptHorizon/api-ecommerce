const { Router } = require("express");
const route = Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../upload/"))
    },
    filename: (req, file, cb) => {
        const ax = Math.random() * 1E9 + "-" + Date.now();
        cb(null, ax + file.originalname)
    }
})
const upload = multer({ storage });

route.get("/", async (req, res, next) => {
    try {
        const { page = 1, limit = 8 } = req.query
        const products = await prisma.product.findMany({
            skip: page,
            take: limit
        });
        res.status(200).json({
            page,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

route.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id }
        });
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});
route.post("/add", upload.single("image"), async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (decoded) {
            const { name, price, description } = req.body;
            const product = await prisma.product.create({
                data: { name, price, description, image: req.file.filename }
            });
            res.status(200).json({
                message: "Product created successfully"
            });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

route.put("/update/:id", async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (decoded) {
            const { id } = req.params;
            const product = await prisma.product.update({
                where: { id },
                data: req.body
            });
            res.status(200).json({
                message: "Product updated successfully"
            })
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({
            message: error
        })
    }
});

route.delete("/delete/:id", async () => {
    try {
        const { authorization } = req.headers;
        const decoded = jwt.verify(authorization, process.env.JWT_SECRET_WEB_TOKEN);
        if (decoded) {
            const { id } = req.params;
            const product = await prisma.product.delete({ where: { id } });
            res.status(200).json({ message: "Product deleted successfully" });
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).json({ message: error });
    }
})



module.exports = route