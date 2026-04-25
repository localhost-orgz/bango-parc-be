import express from "express";
import adminRoutes from "./src/routes/adminRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import cors from "cors";
import authMiddleware from "./src/middlewares/authMiddleware.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  res.status(200).json({ user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
