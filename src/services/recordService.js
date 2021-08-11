
import * as recordRepository from '../repositories/recordRepository.js';

export async function getRecords(userId) {
    
    let records = await recordRepository.findRecordsByUserId(userId);
    let balance = null;

    if(records.length > 0) {
        balance = calculateBalance(records)
        records = implementCurrencyValues(records)
    }

    return {records, balance};
}

function calculateBalance(arrayOfRecord) {

    let balance = arrayOfRecord.reduce((acc, item) => item.type === 'Incomming' ? acc + item.value : acc - item.value , 0);
    balance = (balance/100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

    return balance;
}

function implementCurrencyValues(arrayOfRecord) {

    arrayOfRecord.forEach(r => r.value = (r.value/100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }));

    return arrayOfRecord;
}