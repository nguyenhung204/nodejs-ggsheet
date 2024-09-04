import moment from 'moment-timezone';
import 'dotenv/config';
import { writeDataToCSV } from '../config/writeToCSV.js';
import { cache, addToCache, clearCache, isCacheEmpty } from '../config/cache.js';
import { isValidMssv, doesMssvExist, getGoogleSheetRows } from '../utils/Validator.js';

const sendCachedDataToGoogleSheet = async () => {
    try {
        console.log('Checking if cache is empty:', isCacheEmpty());
        if (isCacheEmpty()) return;

        const rows = await getGoogleSheetRows();
        const sheetMssvMap = new Map();
        rows.forEach(row => sheetMssvMap.set(row.get('MSSV').trim(), row));

        const commonMssvSet = new Set();
        const validCacheData = [];
        cache.data.forEach(item => {
            const mssvList = item.mssvInput.split(',').map(mssv => mssv.trim());
            mssvList.forEach(mssv => {
                if (sheetMssvMap.has(mssv)) {
                    commonMssvSet.add(mssv);
                    validCacheData.push(item);
                }
            });
        });

        // Ghi dữ liệu hợp lệ vào file CSV trước
        await writeDataToCSV(validCacheData);
        console.log('Dữ liệu đã được ghi vào file CSV');

        // Chia nhỏ dữ liệu thành các nhóm nhỏ
        const chunkSize = 25; // Số lượng request mỗi lần gửi
        const delay = 40000; // 30 giây

        const chunks = [];
        for (let i = 0; i < validCacheData.length; i += chunkSize) {
            chunks.push(validCacheData.slice(i, i + chunkSize));
        }
        console.log(`Số lượng nhóm dữ liệu: ${chunks.length}`);
        console.log('Chunks:', chunks);
        clearCache();

        let chunkIndex = 0;

        const processChunk = async () => {
            if (chunkIndex >= chunks.length) {
                clearCache();
                console.log('All data has been sent to Google Sheet and cache is cleared.');
                return;
            }

            const currentChunk = chunks[chunkIndex];
            for (const item of currentChunk) {
                const mssvList = item.mssvInput.split(',').map(mssv => mssv.trim());
                for (const mssv of mssvList) {
                    const row = sheetMssvMap.get(mssv);
                    if (row) {
                        row.set('ĐIỂM DANH', item.formattedDate);
                        await row.save();
                        console.log(`Đã cập nhật dòng dữ liệu cho mssv ${mssv}`);
                    }
                }
            }

            console.log(`Đã gửi nhóm dữ liệu thứ ${chunkIndex + 1} tới Google Sheet`);
            console.log('Current chunk:', currentChunk);
            console.log('Cache data:', cache.data);
            console.log('Common MSSV:', Array.from(commonMssvSet));

            // Xóa dữ liệu cache của nhóm đã gửi
            cache.data = cache.data.filter(item => !currentChunk.includes(item));

            // Tăng chunkIndex sau khi gửi xong nhóm dữ liệu hiện tại
            chunkIndex++;
            console.log('Waiting for the next chunk...', chunkIndex);

            // Đặt thời gian chờ cho lần xử lý tiếp theo
            setTimeout(processChunk, delay);
        };

        // Bắt đầu xử lý ngay lập tức
        processChunk();

    } catch (error) {
        console.error('Error in sendCachedDataToGoogleSheet:', error);
    }
};

setInterval(sendCachedDataToGoogleSheet, cache.ttl);


// const getAllMssv = async (req, res) => {
//     try {
//         const rows = await getGoogleSheetRows();

//         const mssvAndMessage = rows.map(row => {
//             const mssv = row.get('MSSV').trim();

//             if (!mssv) {
//                 return null;
//             }

//             if (!isValidMssv(mssv)) {
//                 console.warn(`MSSV không hợp lệ: ${mssv}`);
//                 return null;
//             }

//             return { mssv, message : "Điểm Danh Thành Công"};
//         }).filter(item => item !== null);

//         return res.send(mssvAndMessage);
//     } catch (e) {
//         console.error('Error in getAllMssv:', e);
//         return res.status(500).send({ message: "Oops! Đã có lỗi xảy ra, vui lòng thử lại sau" });
//     }
// };
const getGoogleSheet = async (req, res) => {
    if (!req.body || !req.body.MSSV) {
        return res.status(400).send({ message: 'MSSV is required' });
    }

    let mssvArray = Array.isArray(req.body.MSSV) ? req.body.MSSV : [req.body.MSSV];
    console.log(`MSSV: ${mssvArray}`);

    try {
        const currentDate = new Date();
        const formattedDate = moment(currentDate).tz("Asia/Ho_Chi_Minh").format("HH:mm DD/MM/YYYY");

        const validMssvArray = mssvArray.filter(mssv => isValidMssv(mssv));
        if (validMssvArray.length === 0) {
            return res.send({ message: 'MSSV KHÔNG HỢP LỆ' });
        }

        
        const rows = await getGoogleSheetRows();
        const sheetMssvMap = new Map(rows.map(row => [row.get('MSSV').trim(), row]));

        const existentMssvWithDate = validMssvArray.filter(mssv => {
            const row = sheetMssvMap.get(mssv.toString().trim());
            return row && !isNaN(Date.parse(row.get('ĐIỂM DANH')));
        });

        if (existentMssvWithDate.length > 0) {
            return res.send({ message: 'SINH VIÊN ĐÃ ĐIỂM DANH' });
        }

        const { nonExistentMssv, existentMssvInfo } = await doesMssvExist(validMssvArray);

        if (existentMssvInfo.length === 0) {
            return res.send({ message: 'MSSV KHÔNG TỒN TẠI' });
        }


        existentMssvInfo.forEach(({ mssv }) => addToCache(mssv.toString().trim(), formattedDate));

        console.log(`Non-existent MSSV: ${nonExistentMssv}`);

        return res.send({
            message: 'YÊU CẦU ĐÃ ĐƯỢC LƯU VÀO BỘ NHỚ CACHE',
            validMssv: existentMssvInfo,
            nonExistentMssv: nonExistentMssv
        });
    } catch (e) {
        console.error('Error in getGoogleSheet:', e);
        return res.status(500).send({ message: "Oops! Đã có lỗi xảy ra, vui lòng thử lại sau" });
    }
};

export default {
    getHomepage: async (req, res) => res.render("homepage.ejs"),
    getGoogleSheet: getGoogleSheet,
    // getAllMssv: getAllMssv,
    sendCachedDataToGoogleSheet: sendCachedDataToGoogleSheet
};