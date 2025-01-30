import UserService from "../../business/services/userService.js";

export const getUserProfile = async (req, res, next) => {
  try {
    // El usuario ya está autenticado gracias a authenticateJWT
    const userId = req.user.id;

    // Buscar al usuario en la base de datos
    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Retornar solo la información necesaria
    res.status(200).json({
      username: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};
