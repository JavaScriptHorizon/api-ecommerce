const exp = require("express");
const cors = require("cors");
const app = exp();
const server = require("http").createServer(app);
app.use(cors());
app.use(exp.json());
app.use(exp.urlencoded({ extended: false }));
app.use(exp.static("upload"));
const port = process.env.PORT || 3200;


app.get("/", (req,res,next) => {
    res.status(200).json({
        message: "Welcome to our API",
    })
})

app.use("/api/v1/auth", require("./routs/user/index"));
app.use("/api/v1/cart", require("./routs/cart/index"));
app.use("/api/v1/product", require("./routs/product/index"));
app.use("/api/v1/order", require("./routs/order/index"));

server.listen(port)