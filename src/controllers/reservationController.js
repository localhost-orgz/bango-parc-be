import { createReservation } from "../services/reservationService.js";

export const makeReservation = async (req, res) => {
  try {
    const created = await createReservation(req.body);
    return res.status(201).json({
      message: "Reservation created successfully",
      data: created,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to create reservation",
    });
  }
};
