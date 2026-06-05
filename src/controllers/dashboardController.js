import { getCardInfo } from "../services/dashboardService.js";

export const getDashboardInfo = async (req, res) => {
  try {
    const dashboardInfo = await getCardInfo();
    return res.json(dashboardInfo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
