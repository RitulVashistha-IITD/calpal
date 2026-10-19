import { RequestHandler } from "express";
import * as authService from "../services/authService";

export const register: RequestHandler = async (req, res) => {
  res.status(201).json(await authService.register(req.body));
};

export const login: RequestHandler = async (req, res) => {
  res.status(200).json(await authService.login(req.body));
};