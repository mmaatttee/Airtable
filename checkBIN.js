/* Script developed for Airtable Automation by @sourcec0de – James Qualls
*/

function fmtBin(bin) {
    return bin.trim()
}

/**
 * checkBIN
 * I had issues with the free bin checker API
 * It seems they're using a captcha so its functionally useless
 * I could be missing somethign though
 * https://api.freebinchecker.com/bin/{bin}
 * 
 * I used APILayer Instead.
 * They're a very cheap option and provide the data we need.
 */
async function checkBIN(bin, apikey) {
    bin = fmtBin(bin)
    
    const res = await fetch(`https://api.apilayer.com/bincheck/${bin}`, {
        headers: { apikey }
    })

    if (!res.ok) {
        throw new Error(`Failed to run BIN check ${res.status} (${res.statusText}): ${await res.text()}`)
    }

    return await res.json()
}

async function getSingleRecordByID(table, recordID) {
    const query = await table.selectRecordsAsync()
    return query.getRecord(recordID)
}

function empty(v) {
  return !v
}

async function updateRecordStatusAndNotes(record, table, status, comment) {
    const notes = newRecord.getCellValueAsString('Notes')
    await table.updateRecordAsync(record, {
        'Status': { 
            name: status
        },
        Notes: [notes, comment].filter(v => !empty(v)).join(', ')
    })
}


// This is a free API key with a limit of 20/day 600/m
// If we need higher limits we can subscribe 
// https://apilayer.com/marketplace/description/bincheck-api
const { recordID, apiKey } = input.config()

const familyTable = base.getTable('Family')
const bankCardField = familyTable.getField('Bank Card Number')
const statusField = familyTable.getField('Status')
const notesField = familyTable.getField('Notes')

let newRecord = await getSingleRecordByID(familyTable, recordID)
const bin = newRecord.getCellValueAsString(bankCardField)
const binStatus = await checkBIN(bin, apiKey)
const foreign = binStatus.country !== 'Ukraine'


if (foreign) {
    await updateRecordStatusAndNotes(newRecord, familyTable, 'Fraud', `Card is not Ukrainian, but ${binStatus.country}`)
    // ensure we have the most up to date version of the record after updating the table
    // not sure if we actually need to do this after updateRecordAsync
    newRecord = await getSingleRecordByID(familyTable, recordID)
}

const query = await familyTable.selectRecordsAsync({
    fields: [statusField, bankCardField, notesField]
})

const duplicates = query.records
    .filter(record => fmtBin(bin) === fmtBin(record.getCellValueAsString('Status')))


for (const record of duplicates) {
    const status = record.getCellValueAsString('Status')
    switch (status) {
        case 'Fraud':
            await updateRecordStatusAndNotes(newRecord, familyTable, 'Fraud', `Duplicate fraudulent record ${record.id}`)
        default:
            await updateRecordStatusAndNotes(newRecord, familyTable, 'Duplicate', `Duplicate of record ${record.id}`)
    }
}
