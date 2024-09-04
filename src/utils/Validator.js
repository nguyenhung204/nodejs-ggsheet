import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const isValidMssv = (mssv) => {
    return /^\d{8}$/.test(mssv.toString().trim());
};

export const getGoogleSheetRows = async () => {
    const serviceAccountAuth = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    return await sheet.getRows();
};

export const doesMssvExist = async (mssvArray) => {
    const rows = await getGoogleSheetRows();
    const sheetMssvMap = new Map(rows.map(row => [row.get('MSSV').trim(), row]));

    const nonExistentMssv = mssvArray.filter(mssv => !sheetMssvMap.has(mssv.toString().trim()));
    const existentMssvInfo = mssvArray
        .filter(mssv => sheetMssvMap.has(mssv.toString().trim()))
        .map(mssv => ({
            mssv,
            message : "ĐIỂM DANH THÀNH CÔNG"
        }));

    return { nonExistentMssv, existentMssvInfo };
};