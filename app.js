import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import areaRoutes from "./src/routes/areaRoutes.js";
import galleryRoutes from "./src/routes/galleryRoutes.js";
import addonRoutes from "./src/routes/addonRoutes.js";
import reservationRoutes from "./src/routes/reservationRoutes.js";
import facilityRoutes from "./src/routes/facilityRoutes.js";

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
app.use("/api/auth", authRoutes);
app.use("/api/area", areaRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/addon", addonRoutes);
app.use("/api/reservation", reservationRoutes);
app.use("/api/facility", facilityRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
