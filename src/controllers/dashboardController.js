import { getCardInfo } from "../services/dashboardService.js";

export const getDashboardInfo = async (req, res) => {
  try {
    const { month, year } = req.query;
    const dashboardInfo = await getCardInfo(month, year);
    return res.json(dashboardInfo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
