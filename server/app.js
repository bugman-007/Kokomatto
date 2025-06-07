const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler");
const apiRouter = require("./routes/api");

const app = express();

// ✅ Define CORS options first
const allowedOrigins = [
  "https://kokomatto.vercel.app",
  "https://staging.kokomatto.com",
  "http://localhost:5000",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
};

// ✅ Correct CORS usage
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight support

// Middlewares
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "healthy", message: "Virtual Try-On API is running" });
});

app.use("/", express.static("public"));

// Error handling
app.use(errorHandler);

module.exports = app;
