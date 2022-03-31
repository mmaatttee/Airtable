let mainTable = base.getTable("PRODUCTS");
let currentView = mainTable.getView("TEST Products")
let mainTableRecords = await currentView.selectRecordsAsync({fields:["Product_ID"]});

console.log("Main Table Records ",mainTableRecords);

let lookupTable = base.getTable("Imported table");
let lookupView = lookupTable.getView("TEST Imp Table");
let lookupRangeRecords = await lookupView.selectRecordsAsync({fields:["ItemNumber","ItemName"]});

console.log("Imported Table Records ",lookupRangeRecords);

for (let record of mainTableRecords.records) {  
     let lookupValue = record.getCellValue("Product_ID");
     console.log("LookupValue ",lookupValue);

   
    for (let rangeRecord of lookupRangeRecords.records) {
                                                             let comparison = rangeRecord.getCellValue("ItemNumber");
                                                             console.log("comparison value ", comparison);
                                                             console.log("before if comparison ", comparison, lookupValue);
                                                             if (comparison === lookupValue) {
                                                                 continue;
                                                                                             }
                                                             console.log("after if comparison ",comparison, lookupValue)
                                                             };
}   
