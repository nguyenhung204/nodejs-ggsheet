import express from "express";
import homepageController from "../controllers/homepageController.js";
import fs from 'fs';
import { writeDataToCSV } from '../config/writeToCSV.js';

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", homepageController.getHomepage);
    router.post("/excel", homepageController.getGoogleSheet); 

    // Endpoint to download the CSV file
    router.get("/download-csv", async (req, res) => {
        const filePath = 'public/data.csv';
        const fileExists = fs.existsSync(filePath);
    
        if (!fileExists) {
            // Tạo file CSV trống nếu file không tồn tại
            await writeDataToCSV([]);
        } else {
            // Kiểm tra xem file có dữ liệu hay không
            const fileData = fs.readFileSync(filePath, 'utf8');
            if (!fileData.trim()) {
                // Tạo file CSV trống nếu file không có dữ liệu
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

    return app.use("/", router);
};

export default initWebRoutes;