
import moment from 'moment-timezone';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import 'dotenv/config';
import { JWT } from 'google-auth-library';
import { writeDataToCSV } from '../config/writeToCSV.js';
import {cache, addToCache, clearCache, isCacheEmpty } from '../config/cache.js';


// const getTimeInMilliseconds = () => {
//     return new Date().getTime();
// };


// Function to send cached data to Google Sheets
const sendCachedDataToGoogleSheet = async () => {
    if (isCacheEmpty()) return;

    // Write data to CSV
    await writeDataToCSV(cache.data);

    const serviceAccountAuth = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    // let startTime = getTimeInMilliseconds();
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    // let endTime = getTimeInMilliseconds()-startTime;
    // console.log(`Time taken to load row data to Google Sheets: ${endTime} ms`);
    for (let i = 0; i < cache.data.length; i++) {
        const { mssvInput, formattedDate } = cache.data[i];
        for (let j = 0; j < rows.length; j++) {
            // let endTime1 = getTimeInMilliseconds();
            let mssv = rows[j].get('MSSV');
            if (mssv === mssvInput) {
                rows[j].set('Điểm danh', formattedDate);
                await rows[j].save();
                console.log(`Điểm danh thành công cho MSSV: ${mssv}`);
                // let endTime2 = getTimeInMilliseconds()-endTime1;
                // console.log(`Time taken to loop ${i, j} for data in Google Sheets: ${endTime2} ms`);
                break;
            }
        }
    }
    clearCache();
    // let Total  = getTimeInMilliseconds() - startTime;
    // console.log(`Total time taken to send data to Google Sheets: ${Total} ms`);
    
   
};

setInterval(sendCachedDataToGoogleSheet, cache.ttl);


// Function to get homepage
let getHomepage = async (req, res) => {
    return res.render("homepage.ejs");
};

// Function to get Google Sheet
let getGoogleSheet = async (req, res) => {
    const mssvInput = req.body.MSSV;
    try {
        let currentDate = new Date();
        const format = "HH:mm DD/MM/YYYY";
        const timeZone = "Asia/Ho_Chi_Minh";
        let formattedDate = moment(currentDate).tz(timeZone).format(format);
        // Add request to cache
        addToCache(mssvInput, formattedDate);
        return res.send({
            message: 'Yêu cầu đã được lưu vào bộ nhớ cache. Dữ liệu sẽ được gửi đến Google Sheets sau 2 phút.',
        });
    } catch (e) {
        console.error(e);
        return res.send({ message: "Oops! Đã có lỗi xảy ra, vui lòng thử lại sau" });
    }
};
export default {
    getHomepage: getHomepage,
    getGoogleSheet: getGoogleSheet
};