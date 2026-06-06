import { checkAndSendReminders } from "../cronjob/cron.js";

export const runReminders = async (req, res) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[CRON] CRON_SECRET belum dikonfigurasi di environment.");
    return res.status(500).json({
      success: false,
      message: "Cron secret is not configured",
    });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  try {
    console.log("[CRON] Memulai proses pengecekan reminder...");
    await checkAndSendReminders();
    console.log("[CRON] Proses reminder selesai.");

    return res.status(200).json({
      success: true,
      message: "Reminders processed successfully",
    });
  } catch (error) {
    console.error("[CRON] Terjadi kesalahan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
