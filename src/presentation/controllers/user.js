import { userService } from "../../config/serviceContainer.js";

export const post = async (req, res, next) => {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const players = await userService.getAllUsers();
    res.status(200).json(players);
  } catch (error) {
    next(error);
  }
};

export const get = async (req, res, next) => {
  try {
    const player = await userService.getUserById(req.params.id);
    res.status(200).json(player);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
