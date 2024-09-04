import express from "express";
import homepageController from "../controllers/homepageController.js";
import fs from 'fs';
import { writeDataToCSV } from '../config/writeToCSV.js';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.post("/excel", homepageController.getGoogleSheet);
    // router.get("/all-mssv-seats", homepageController.getAllMssv);

    router.get("/download-csv", async (req, res) => {
        const filePath = 'public/data.csv';
        const fileExists = fs.existsSync(filePath);

        if (!fileExists) {
            await writeDataToCSV([]);
        } else {
            const fileData = fs.readFileSync(filePath, 'utf8');
            if (!fileData.trim()) {
                await writeDataToCSV([]);
            }
        }

        res.download(filePath, 'data.csv', (err) => {
            if (err) {
                console.error("Error downloading the file:", err);
                res.status(500).send("Error downloading the file.");
            }
        });
    });

    app.use("/", router);

    // Middleware xử lý lỗi toàn cục
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        res.status(500).send('Internal Server Error');
    });
};

export default initWebRoutes;