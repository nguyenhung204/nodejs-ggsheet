import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import initWebRoutes from "./routes/web.js";
import configViewEngine from "./config/viewEngine.js";

let app = express();

//use body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//config view engine
configViewEngine(app);

// init all web routes
initWebRoutes(app);


let port = process.env.PORT || 8080;

app.listen(port, ()=>{
   console.log(`App is running at the port ${port}`);
});
