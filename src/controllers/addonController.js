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
    const { name, price, description } = req.body;
    const addon = await addonService.createAddon(name, price, description);
    res.status(201).json({ success: true, data: addon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAddonById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const addon = await addonService.getAddonById(id);
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
    const id = parseInt(req.params.id, 10);

    const data = req.body;
    const addon = await addonService.updateAddon(id, data);
    res.status(200).json({ success: true, data: addon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteAddon = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    await addonService.deleteAddon(id);
    res
      .status(200)
      .json({ success: true, message: "Addon deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
