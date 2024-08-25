import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

export const writeDataToCSV = async (data) => {
    const filePath = 'public/data.csv';
    const fileExists = fs.existsSync(filePath);

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'mssvInput', title: 'MSSV' },
            { id: 'formattedDate', title: 'Date' }
        ],
        append: fileExists
    });

    await csvWriter.writeRecords(data);
    console.log('Data has been written to CSV file');
};