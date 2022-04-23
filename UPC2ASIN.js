/*******************************************************************************
Title: BarcodeSpider Lookup
Author: Matteo Cossu
Date Created: April 22, 2022
Version: 1.0
Copyright (c) 2022 by Matteo Cossu,
Usage License: Proprietary
## Description
This script was coded for Greg Smith and designed for use in the Scripting Block of an
(Airtable)[airtable.com] database.
It calls the BarcodeSPider API in batches of 50 records from a field-selected table. It looks up the ASIN code from the corresponding barcode (UPC).
## Airtable Requirements
- Scripting Block installed
- Editor or higher permissions
## How To Use This Script
1. Open an Airtable base with the Scripting Block installed.
2. Copy and paste this script into the code editor.
3. Run the script.
This script requires to comment out all output and console.log's if to be used within an Automation.
This script requires no changes to the structure of the database.
********************************************************************************
********************************************************************************/

// edit these values to match current base
let selectTable = base.getTable("ASIN");
let currentView = selectTable.getView('TEMP');

//set counter for total
let errCounter = 0;

// Load all of the records in the table
let recordsAll = await currentView.selectRecordsAsync();

//select non-empty records
let nonEmptyRecords = recordsAll.records.filter(record => {
      // this below picks records which have values in the field ("Barcode")
      let nonEmptyBC = record.getCellValue("Barcode");
      // this below picks records which have values in the field ("ASIN")
      let nonEmptyAS = record.getCellValue("ASIN");
      // this below creates a subarray of records which have values in the field ("Barcode"), and excludes the records which have values in the field ("ASIN")
      return nonEmptyBC && !nonEmptyAS;
  });
console.log("numbers of records to process =", nonEmptyRecords.length);

//convert to simple array with records to update
  let recordsNeedAS =  [];

  for (let record of nonEmptyRecords) {
      recordsNeedAS.push({
        "airtableID" : record.id,
        "barcode" : record.getCellValue("Barcode")
      });
  }
  let totalNumberNeedID = recordsNeedAS.length;
 // console.log('record of nonEmptyRecords ',recordsNeedAS);

  let arrayBC = [];
  let responseArray = [];

// batch process and update records in increments of 50
  while (recordsNeedAS.length > 0) {
     
    //prepare batch of 50
    let batch = recordsNeedAS.slice(0, 50);
    arrayBC = batch.map(recordsNeedAS => recordsNeedAS.barcode);
   // console.log('this is the batch array ', batch);
   // console.log('this is the arrayBC array ', arrayBC);

      
        for (let it = 0; it < batch.length; it++) {
          function delay(seconds) {
          const startTime = Date.now()
          while (Date.now() - startTime < seconds * 1000)
          continue
                                  }
          delay(10)
        //prepare variables for http fetch request to API
            let url=`https://api.barcodespider.com/v1/lookup?upc=${arrayBC[it]}`;
            let apiResponse = await remoteFetchAsync(url,{
                                            method: "get",
                                            headers: {
                                                      'token'  : 'XXX',
                                                      'Accept' : 'application/json'
                                                     }
                                          }
                                      );

            console.log('this is the url generated, ', url);
            console.log('this is the api response ', apiResponse); 
      
            let humanResponse = await apiResponse.json();
            console.log('this is the human response ', it, humanResponse);
            if (apiResponse.status === 200) {
            await selectTable.updateRecordsAsync([{id : batch[it].airtableID, fields:{'ASIN' : humanResponse.item_attributes.asin}
                                           }]);
                                           }
            else { 
              errCounter++; 
              console.log('API returned Error!',  'UPC =', arrayBC[it],  'due to', humanResponse.item_response.status, humanResponse.item_response.message);
                 };
            recordsNeedAS = recordsNeedAS.slice(50);
                                                  }
 output.text(`Processed ${totalNumberNeedID-recordsNeedAS.length}/${totalNumberNeedID} records`);

    } 

  
    
