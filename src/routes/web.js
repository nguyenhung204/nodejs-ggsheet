import express from "express";
import homepageController from "../controllers/homepageController.js";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.post("/excel", homepageController.getGoogleSheet); 
    return app.use("/", router);
};

export default initWebRoutes;