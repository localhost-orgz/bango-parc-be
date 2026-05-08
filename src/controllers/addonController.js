import * as addonService from "../services/addonService.js";

export const getAllAddons = async (req, res) => {
  try {
    const search = req.query.search || undefined;
    const addons = await addonService.getAllAddons(search);
    res.status(200).json({ success: true, data: addons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddon = async (req, res) => {
  try {
    const { name, price, unit } = req.body;
    const addon = await addonService.createAddon(name, price, unit);
    res.status(201).json({ success: true, data: addon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAddonById = async (req, res) => {
  try {
    const { uuid } = req.params;
    const addon = await addonService.getAddonById(uuid);
    if (!addon) {
      return res
        .status(404)
        .json({ success: false, message: "Addon not found" });
    }
    res.status(200).json({ success: true, data: addon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddon = async (req, res) => {
  try {
    const { uuid } = req.params;
    const data = req.body;
    const addon = await addonService.updateAddon(uuid, data);
    res.status(200).json({ success: true, data: addon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAddon = async (req, res) => {
  try {
    const { uuid } = req.params;
    await addonService.deleteAddon(uuid);
    res
      .status(200)
      .json({ success: true, message: "Addon deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
