import * as areaService from "../services/areaService.js";

export const createArea = async (req, res) => {
  try {
    const area = await areaService.createArea(req.body);
    res.status(201).json({ success: true, data: area });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllArea = async (req, res) => {
  try {
    const search = req.query.search || undefined;
    const areas = await areaService.getAllArea(search);
    res.status(200).json({ success: true, data: areas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAreaById = async (req, res) => {
  try {
    const { uuid } = req.params;
    const area = await areaService.getAreaById(uuid);
    if (!area) {
      return res
        .status(404)
        .json({ success: false, message: "Area not found" });
    }
    res.status(200).json({ success: true, data: area });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateArea = async (req, res) => {
  try {
    const { uuid } = req.params;
    const area = await areaService.updateArea(uuid, req.body);
    res.status(200).json({ success: true, data: area });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteArea = async (req, res) => {
  try {
    const { uuid } = req.params;
    await areaService.deleteArea(uuid);
    res
      .status(200)
      .json({ success: true, message: "Area deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
