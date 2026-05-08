import * as areaService from "../services/areaService.js";

// === AreaType ===
export const createArea = async (req, res) => {
  try {
    const areaTypeData = {
      areaName: req.body.areaName,
      maxCapPax: req.body.maxCapPax,
      electricPowerWatt: req.body.electricPowerWatt,
      isWeddingAvailable: req.body.isWeddingAvailable,
    };

    const areaPricePlanData = req.body.areaPricePlans;
    const area = await areaService.createArea(areaTypeData, areaPricePlanData);
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

// === AreaPricePlan
export const createAreaPricePlan = async (req, res) => {
  try {
    const { areaTypeId } = req.params;
    const { areaPricePlans } = req.body;

    const created = await areaService.createPricePlan(
      areaTypeId,
      areaPricePlans,
    );

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAreaPricePlan = async (req, res) => {
  try {
    const { areaPricePlans } = req.body;

    const updatedPlans = await areaService.updatePricePlan(areaPricePlans);
    res.status(200).json({ success: true, data: updatedPlans });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAreaPricePlan = async (req, res) => {
  try {
    const { id } = req.params;
    await areaService.deletePricePlan(parseInt(id));
    res
      .status(200)
      .json({ success: true, message: "Area price plan deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
