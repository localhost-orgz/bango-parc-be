import axios from "axios";
import "dotenv/config";

export const sendWhatsappNotification = async (target, message) => {
  const endpoint = "https://api.fonnte.com/send";
  const apiKey = process.env.FONNTE_TOKEN;

  if (!apiKey) {
    console.error("FONNTE_TOKEN belum dikonfigurasi di environment.");
    return false;
  }

  if (!target) {
    console.error("Nomor WhatsApp tujuan tidak tersedia.");
    return false;
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        target: target,
        message: message,
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data.status) {
      console.log(`Notifikasi berhasil dikirim ke ${target}`);
      return true;
    }

    console.error(`Gagal mengirim pesan: ${response.data.reason}`);
    return false;
  } catch (error) {
    console.error("Terjadi kesalahan saat menghubungi API Fonnte:", error);
    return false;
  }
};
