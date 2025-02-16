import express from "express";
import { loginUser, createUser } from "../controllers/user.controllers.js";


const routes = express.Router();

routes.post("/register", createUser);
routes.post("/login", loginUser);

export default routes;