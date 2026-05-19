import * as reservationTypeService from "../services/reservationTypeService.js";

export const createReservationType = async (req, res) => {
  try {
    const reservationType = await reservationTypeService.createReservationType(
      {
        name: req.body.name,
        durationIntervalHour: req.body.durationIntervalHour,
      },
    );
    res.status(201).json({ success: true, data: reservationType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllReservationTypes = async (req, res) => {
  try {
    const search = req.query.search || undefined;
    const reservationTypes =
      await reservationTypeService.getAllReservationTypes(search);
    res.status(200).json({ success: true, data: reservationTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReservationTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservationType = await reservationTypeService.getReservationTypeById(
      parseInt(id),
    );
    if (!reservationType) {
      return res
        .status(404)
        .json({ success: false, message: "Reservation type not found" });
    }
    res.status(200).json({ success: true, data: reservationType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReservationType = async (req, res) => {
  try {
    const { id } = req.params;
    const reservationType = await reservationTypeService.updateReservationType(
      parseInt(id),
      req.body,
    );
    res.status(200).json({ success: true, data: reservationType });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteReservationType = async (req, res) => {
  try {
    const { id } = req.params;
    await reservationTypeService.deleteReservationType(parseInt(id));
    res.status(200).json({
      success: true,
      message: "Reservation type deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
