import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationMail = async (to, name, token) => {
  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "Account Verification - Bango Parc",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #333;">Halo, ${name}!</h2>
        <p>Terima kasih telah mendaftar di Bango Parc. Selesaikan pendaftaran Anda dengan memverifikasi email.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verifikasi Email Saya
          </a>
        </div>
        <p style="font-size: 12px; color: #777;">Link ini hanya berlaku untuk 24 jam. Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email send: " + info.messageId);
  } catch (error) {
    console.error("Failed sending email:", error);
    throw new Error("Failed sending verification email");
  }
};
