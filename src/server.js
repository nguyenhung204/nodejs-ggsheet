import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import initWebRoutes from "./routes/web.js";
import configViewEngine from "./config/viewEngine.js";

let app = express();

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