// edit these values to match current base
let selectTable = base.getTable("PRODUCTS");
let currentView = selectTable.getView('TEMP');

//set counter for total
let errCounter = 0;

// Load all of the records in the table
let recordsAll = await currentView.selectRecordsAsync();

//select non-empty records
let nonEmptyRecords = recordsAll.records.filter(record => {
      // this below picks records which have values in the field ("item_number")
      let nonEmptyIN = record.getCellValue("item_number");
      // this below picks records which have values in the field ("Americommerce ID")
      let nonEmptyID = record.getCellValue("Americommerce ID");
      // this below creates a subarray of records which have values in the field ("item_number"), and excludes the records which have values in the field ("Americommerce ID")
      return nonEmptyIN && !nonEmptyID;
  });
console.log("numbers of records to process =", nonEmptyRecords.length);

//convert to simple array with records to update
  let recordsNeedID =  [];

  for (let record of nonEmptyRecords) {
      recordsNeedID.push({
        "airtableID" : record.id,
        "item_number" : record.getCellValue("item_number")
      });
  }
  let totalNumberNeedID = recordsNeedID.length;
 // console.log('record of nonEmptyRecords ',recordsNeedID);

  let arrayIN = [];
  let responseArray = [];

// batch process and update records in increments of 50
  while (recordsNeedID.length > 0) {
     
    //prepare batch of 50
    let batch = recordsNeedID.slice(0, 50);
    arrayIN = batch.map(recordsNeedID => recordsNeedID.item_number);
   // console.log('this is the batch array ', batch);
   // console.log('this is the arrayIN array ', arrayIN);

    for (let it = 0; it < batch.length; it++) {

    //prepare variables for http fetch request to API
        let url=`https://www.mindkits.co.nz/api/v1/products?item_number=${arrayIN[it]}`;
        let apiResponse = await fetch(url,{
                                            method: "get",
                                            headers: {
                                                      'X-AC-Auth-Token': '262557690032eacfad64023e3494dafb',
                                                      'Accept'         : 'application/json'
                                                     }
                                          }
                                      );

     // console.log('this is the url generated, ', url);
     // console.log('this is the api response ', apiResponse); 
      
        let humanResponse = await apiResponse.json();
      //humanResponse = humanResponse.total_count;
      //let goodResopnse = humanResponse.products; 
      if (humanResponse.total_count !== 0) 
      { 
       // console.log('this is the human response ', it, humanResponse.products[0].id);
        //console.log(batch[it].airtableID, responseArray[0].acID);
        //await selectTable.updateRecordAsync(responseArray[it].atID, {'Americommerce ID': responseArray[it].acID});
        await selectTable.updateRecordsAsync([{id : batch[it].airtableID, fields:{'Americommerce ID' : humanResponse.products[0].id}
                                           }]);
        }
      else { 
              await selectTable.updateRecordsAsync([{id : batch[it].airtableID, fields:{'Americommerce ID' : 9999999999}
                                           }]);
              errCounter++; 
              console.log('Not Found in Americommerce', errCounter);
         };
    }
    recordsNeedID = recordsNeedID.slice(50);
  }
  output.text(`Updated ${totalNumberNeedID-recordsNeedID.length}/${totalNumberNeedID} records`);
