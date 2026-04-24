import {
  registerCustomer,
  verifyEmailToken,
  loginCustomer,
} from "../services/authService.js";
import { sendVerificationMail } from "../utils/mailer.js";

export const register = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, password } = req.body;

    const name = `${firstname} ${lastname}`;

    const result = await registerCustomer({ name, email, phone, password });

    await sendVerificationMail(email, name, result.verificationToken);

    res.status(201).json({
      success: true,
      message: "Registration successfuly, verify email now!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }

    await verifyEmailToken(token);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { admin, token } = await loginCustomer(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      admin,
      token,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
