import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import citiesRouter from "./tours/cities.js";
import searchRouter from "./tours/search.js";
import adminSettingsRouter from "./admin/settings.js";
import authRouter from "./auth.js";
import savedToursRouter from "./user/savedTours.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/tours/cities", citiesRouter);
router.use("/tours/search", searchRouter);
router.use("/admin/settings", adminSettingsRouter);
router.use("/user/saved-tours", savedToursRouter);

export default router;
