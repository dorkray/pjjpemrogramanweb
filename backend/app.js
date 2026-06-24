require("dotenv").config();
const express = require("express");
const path = require("path");
const router = require("./routes/api");
const errorHandler = require("./middleware/errorHandler");
const cors = require('cors');

const app = express();
app.use(cors());

// Parsing JSON dan URL-encoded
app.use(express.json());
app.use((req, res, next) => {
    console.log(`Ada request masuk: ${req.method} ${req.url}`);
    console.log("Body:", req.body);
    next();
});
app.use(express.urlencoded({ extended: true }));

// Sajikan file statis frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Prefix untuk semua rute API
app.use("/api", router);

// Middleware Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running pada http://localhost:${PORT}`);
});