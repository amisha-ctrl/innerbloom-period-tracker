require("dotenv").config();

const path = require("path");
const express = require("express");
const userRouter = require("./routes/userRoutes.js");
const periodRouter = require("./routes/periodRoutes.js");

const app = express();

const connectDB = require("./config/db.js");
connectDB();

const filePath = path.join(__dirname, "public");

app.use(express.json());
app.use(express.static(filePath));
app.use("/users", userRouter);
app.use("/users/period/", periodRouter);

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(filePath, "index.html"));
})

app.use((req, res) => {
    res.status(404).sendFile(path.join(filePath, "pageNotFound.html"));
})

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT} at ${process.env.HOST_LINK}`);
});