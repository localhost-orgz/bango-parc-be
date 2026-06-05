import { getCardInfo } from "../services/dashboardService.js";

export const getDashboardInfo = async (req, res) => {
  try {
    const { year } = req.query;
    const dashboardInfo = await getCardInfo(year);
    return res.json(dashboardInfo);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
