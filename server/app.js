const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler");
const apiRouter = require("./routes/api");
const config = require("./config");
const app = express();

// Middlewares
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors(config.corsOptions));
const allowedOrigins = [
  "https://kokomatto.vercel.app",
  "https://staging.kokomatto.com",
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

app.use(cors(corsOptions));
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
