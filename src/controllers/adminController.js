import { loginAdmin } from "../services/authService.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { admin, token } = await loginAdmin(email, password);
    res.status(200).json({ message: "login success", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
