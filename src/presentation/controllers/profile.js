import { userService } from "../../config/serviceContainer.js";


export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      username: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};
