const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const writeDataToCSV = async (data) => {
    const filePath = 'data/data.csv';
    const fileExists = fs.existsSync(filePath);

    const csvWriter = createCsvWriter({
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

module.exports = {
    writeDataToCSV
};