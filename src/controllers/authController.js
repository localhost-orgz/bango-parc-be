import { signin, signup, verifyEmailToken } from "../services/authService.js";
import { sendVerificationMail } from "../utils/mailer.js";

export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await signin(email, password);
    res.status(200).json({
      message: "Signin successful",
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const signupUser = async (req, res) => {
  try {
    const user = await signup(req.body);

    await sendVerificationMail(
      user.email,
      user.fullName,
      user.verificationToken,
    );

    res.status(201).json({
      message: "Signup successful. Please verify your email before logging in.",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required." });
    }

    const updatedUser = await verifyEmailToken(token);

    res.status(200).json({
      message: "Email verified successfully.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
