import * as facilityService from "../services/facilityService.js";

export const createFacility = async (req, res) => {
  try {
    const facilityData = {
      name: req.body.name,
      icon: req.body.icon,
      value: req.body.value,
      isDisplay: req.body.isDisplay,
    };

    const facility = await facilityService.createFacility(facilityData);
    res.status(201).json({ success: true, data: facility });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllFacility = async (req, res) => {
  try {
    const search = req.query.search || undefined;
    const facilities = await facilityService.getAllFacility(search);
    res.status(200).json({ success: true, data: facilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFacilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await facilityService.getFacilityById(parseInt(id));
    if (!facility) {
      return res
        .status(404)
        .json({ success: false, message: "Facility not found" });
    }
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const facility = await facilityService.updateFacility(
      parseInt(id),
      req.body,
    );
    res.status(200).json({ success: true, data: facility });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;
    await facilityService.deleteFacility(parseInt(id));
    res
      .status(200)
      .json({ success: true, message: "Facility deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
