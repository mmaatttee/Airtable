//Substitute "Orders" for table name which contains values
//on which you want to run the vlookup
let mainTable = base.getTable("Orders");
let mainTableRecords = await mainTable.selectRecordsAsync({fields:["Item.barcode"]});

//Substitute "Product" for table which contains range to search in
let lookupTable = base.getTable("Products");
let lookupRangeRecords = await lookupTable.selectRecordsAsync({fields:["Barcode","Name"]});

//Replace "Item.barcode" with column name which has the values you want to look up 
for (let record of mainTableRecords.records) {  
     let lookupValue = record.getCellValue("Item.barcode");

    //Replace "Barcode" with column name which is the range to search in
    //Replace "Name" with columnn name which value should be returned
    for (let rangeRecord of lookupRangeRecords.records) {
        if (rangeRecord.getCellValue("Barcode") === lookupValue) {
            let returnValue = rangeRecord.getCellValue("Name");
     
            //Replace "Proper Name" with column name from mainTable which should contain the link
            await mainTable.updateRecordAsync(record, {
                "Proper Name": returnValue
            });
       }
    }
}
