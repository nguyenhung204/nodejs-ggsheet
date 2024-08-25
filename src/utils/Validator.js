import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export const isValidMssv = (mssv) => {
    return /^\d{8}$/.test(mssv.toString().trim());
};

export const doesMssvExist = async (mssvArray) => {
    const serviceAccountAuth = new JWT({
        email: process.env.CLIENT_EMAIL,
        key: process.env.PRIVATE_KEY.split(String.raw`\n`).join('\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const sheetMssvMap = new Map(rows.map(row => [row.get('MSSV').trim(), row]));

    return mssvArray.filter(mssv => !sheetMssvMap.has(mssv.toString().trim()));
};