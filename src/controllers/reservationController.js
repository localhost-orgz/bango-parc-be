import {
  createReservation,
  getAllReservation,
  rescheduleReservation,
} from "../services/reservationService.js";

export const makeReservation = async (req, res) => {
  try {
    const reservation = await createReservation(req.body);
    return res.status(201).json({
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to create reservation",
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const reservations = await getAllReservation();
    return res.status(200).json({
      message: "Reservations fetched successfully",
      data: reservations,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to fetch reservations",
    });
  }
};

export const reschedule = async (req, res) => {
  try {
    const reservationId = Number(req.params.reservationId);
    const reservation = await rescheduleReservation(reservationId, req.body);

    return res.status(200).json({
      success: true,
      message: "Reservation rescheduled successfully",
      data: reservation,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to fetch reservations",
    });
  }
};
