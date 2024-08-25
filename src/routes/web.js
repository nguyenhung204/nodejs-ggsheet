import express from "express";
import homepageController from "../controllers/homepageController.js";

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.post("/excel", homepageController.getGoogleSheet); 

    // Endpoint to download the CSV file
    router.get("/download-csv", (req, res) => {
        const filePath = 'public/data/data.csv';
        res.download(filePath, 'data.csv', (err) => {
            if (err) {
                console.error("Error downloading the file:", err);
                res.status(500).send("Error downloading the file.");
            }
        });
    });

    return app.use("/", router);
};

export default initWebRoutes;