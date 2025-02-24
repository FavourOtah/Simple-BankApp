import express from "express"
import authorization from "../middlewares/authorization.js"
import { internalTransfer, externalTransfer, getAllTransactions } from "../controllers/transaction/transController.js"



const routes = express.Router();

routes.post("/transfer/internal", authorization, internalTransfer)
routes.post("/transfer/external", authorization, externalTransfer)
routes.post("/account", getAllTransactions)



export default routes
