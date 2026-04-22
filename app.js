import express from "express";

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default app;