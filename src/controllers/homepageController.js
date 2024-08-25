import moment from 'moment-timezone';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import 'dotenv/config';
import { JWT } from 'google-auth-library';
import { writeDataToCSV } from '../config/writeToCSV.js';
import { cache, addToCache, clearCache, isCacheEmpty } from '../config/cache.js';
import { isValidMssv, doesMssvExist } from '../utils/Validator.js';

const sendCachedDataToGoogleSheet = async () => {
    if (isCacheEmpty()) return;

    const serviceAccountAuth = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    // Load all sheet data at once for efficiency
    const rows = await sheet.getRows();
    const sheetMssvMap = new Map();
    rows.forEach(row => sheetMssvMap.set(row.get('MSSV').trim(), row));

    // Process cached data
    const commonMssv = [];
    const validCacheData = [];
    for (const item of cache.data) {
        const mssvList = item.mssvInput.split(',').map(mssv => mssv.trim());
        for (const mssv of mssvList) {
            if (sheetMssvMap.has(mssv)) { // Check existence with Map lookup
                commonMssv.push(mssv);
                validCacheData.push(item);

                // Update row using Map lookup
                const row = sheetMssvMap.get(mssv);
                if (row) {
                    row.set('Điểm danh', item.formattedDate);
                    await row.save();
                    console.log(`Đã cập nhật dòng dữ liệu cho mssv ${mssv}`);
                }
            }
        }
    }

    // Write valid data to CSV
    await writeDataToCSV(validCacheData);

    console.log(`Dữ liệu chung giữa cache và Google Sheet: ${commonMssv.length} mssv`);
    clearCache();
};
setInterval(sendCachedDataToGoogleSheet, cache.ttl);

let getHomepage = async (req, res) => {
    return res.render("homepage.ejs");
};

const getGoogleSheet = async (req, res) => {
    let mssvArray = Array.isArray(req.body.MSSV) ? req.body.MSSV : [req.body.MSSV];
    console.log(`MSSV: ${mssvArray}`);

    try {
        const currentDate = new Date();
        const formattedDate = moment(currentDate).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY");

        // Lọc các MSSV hợp lệ
        const validMssvArray = mssvArray.filter(mssv => isValidMssv(mssv));
        if (validMssvArray.length === 0) {
            return res.send({ message: 'Không có MSSV hợp lệ' });
        }

        // Kiểm tra xem MSSV hợp lệ có tồn tại trong Google Sheet hay không
        const nonExistentMssv = await doesMssvExist(validMssvArray);
        const existentMssvArray = validMssvArray.filter(mssv => mssv !== nonExistentMssv);

        if (existentMssvArray.length === 0) {
            return res.send({ message: 'Không có MSSV tồn tại trong sheet' });
        }

        // Lưu dữ liệu vào cache
        existentMssvArray.forEach(mssv => addToCache(mssv.toString().trim(), formattedDate));

        return res.send({ message: 'Yêu cầu đã được lưu vào bộ nhớ cache.', validMssv: existentMssvArray });
    } catch (e) {
        console.error(e);
        return res.send({ message: "Oops! Đã có lỗi xảy ra, vui lòng thử lại sau" });
    }
};

export default {
    getHomepage: getHomepage,
    getGoogleSheet: getGoogleSheet
};