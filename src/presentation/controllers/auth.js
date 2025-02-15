import { authService } from "../../config/serviceContainer.js";


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticate({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const result = await authService.logout(token); 
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};