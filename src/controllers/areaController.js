import * as areaService from "../services/areaService.js";

export const createArea = async (req, res) => {
  try {
    const { name, description, facilityIds } = req.body;
    const area = await areaService.createArea(
      { name, description },
      facilityIds ?? [],
    );
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
    const id = parseInt(req.params.id);
    const area = await areaService.getAreaById(id);
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
    const id = parseInt(req.params.id);
    const { name, description, facilityIds } = req.body;
    const area = await areaService.updateArea(
      id,
      { name, description },
      facilityIds,
    );
    res.status(200).json({ success: true, data: area });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteArea = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await areaService.deleteArea(id);
    res
      .status(200)
      .json({ success: true, message: "Area deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
