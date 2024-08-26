import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

export const writeDataToCSV = async (data) => {
    const filePath = 'public/data.csv';
    const fileExists = fs.existsSync(filePath);

    let existingMssvSet = new Set();

    if (fileExists) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const lines = fileData.split('\n');
        lines.forEach(line => {
            const [mssv] = line.split(',');
            if (mssv && mssv !== 'MSSV') {
                existingMssvSet.add(mssv.trim());
            }
        });
    } else {
       
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'mssvInput', title: 'MSSV' },
                { id: 'formattedDate', title: 'Điểm danh' }
            ],
            append: false 
        });

        await csvWriter.writeRecords([]); 
    }

    const filteredData = data.filter(item => !existingMssvSet.has(item.mssvInput.trim()));

    if (filteredData.length === 0) {
        console.log('Không có dữ liệu mới để ghi vào file CSV');
        return;
    }

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'mssvInput', title: 'MSSV' },
            { id: 'formattedDate', title: 'Điểm Danh' }
        ],
        append: true // Append dữ liệu mới vào file
    });

    await csvWriter.writeRecords(filteredData);
    console.log('Data has been written to CSV file');
};