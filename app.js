import express from "express";
import adminRoutes from "./src/routes/adminRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
