import express from "express";
import createAccount from "../controllers/account.controllers.js";
import authorization from "../middlewares/authorization.js";


const routes = express.Router();

routes.post("/createAccount", authorization, createAccount);

export default routes;