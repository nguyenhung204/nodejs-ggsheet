import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import initWebRoutes from "./routes/web.js";
import configViewEngine from "./config/viewEngine.js";
import { writeDataToCSV } from './config/writeToCSV.js';
import fs from 'fs';
import compression from 'compression';

const filePath = 'public/data.csv';
const fileExists = fs.existsSync(filePath);

if (!fileExists) {
    writeDataToCSV([]).then(() => {
        console.log('File data.csv đã được tạo với tiêu đề.');
    }).catch(err => {
        console.error('Lỗi khi tạo file data.csv:', err);
    });
}

let app = express();

// Use compression middleware
app.use(compression());
//use body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

//config view engine
configViewEngine(app);

// init all web routes
initWebRoutes(app);

let port = process.env.PORT || 8080;

app.listen(port, ()=>{
   console.log(`App is running at the port ${port}`);
});

// Xử lý các lỗi không được bắt
process.on('unhandledRejection', (reason, promise) => {
   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
   console.error('Uncaught Exception:', error);
   process.exit(1); 
});