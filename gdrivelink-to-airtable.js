// edit these values to match current base
let selectTable = base.getTable("Sandbox");
let currentView = selectTable.getView('Grid view');

//set counter for total
let counter = 0;

// Load all of the records in the table
//let recordsAll = await currentView.selectRecordsAsync({fields:["GDrive Link File ID"]});
let recordsAll = await currentView.selectRecordsAsync();

//select non-empty records
let nonEmptyRecords = recordsAll.records.filter(record => {
      // this below picks records which have values in the field ("To Translate")
      let nonEmptyValueToTrans = record.getCellValue("GDrive Link");
      // this below picks records which have values in the field ("Translated")
      let nonEmptyValueTrans = record.getCellValue("Thumbnail");
      // this below creates a subarray od records which have values in the field ("Translated"), and excludes the records which have values in the field ("Translated")
      return nonEmptyValueToTrans && !nonEmptyValueTrans;
  });
console.log("numbers of records to process =", nonEmptyRecords.length);

//convert to simple array with records to translate
  let recordsNeedThumbNail =  [];

  for (let record of nonEmptyRecords) {
      recordsNeedThumbNail.push({
        "airtableID" : record.id,
        "googleID" :   record.getCellValue("GDrive Link File ID")
      });
  }
  let totalNumberNeedThumbNail = recordsNeedThumbNail.length;
output.inspect(recordsNeedThumbNail);

    let gDriveID = [];
    let responseArray = [];

// batch translate and update records in increments of 50
  while (recordsNeedThumbNail.length > 0) {
     
    //prepare batch of 50
    let batch = recordsNeedThumbNail.slice(0, 50);
    gDriveID = batch.map(recordsNeedThumbNail => recordsNeedThumbNail.googleID);
    console.log('this is the batch array ', batch);
    console.log('this is the gDriveID array ', gDriveID);

    for (let it = 0; it < batch.length; it++) {

 //prepare variables for http fetch request to API
      let url=`https://www.googleapis.com/drive/v3/files/${gDriveID[it]}?fields=name%2C%20hasThumbnail%2C%20thumbnailLink`;


      let apiResponse = await fetch(url,{
      method: "get",
      headers: {
          'Authorization': 'Bearer ya29.A0ARrdaM9iLSLihvnvH3xza1mznXzvTR3o7YXZ_8NVaSSYFKbEGngqkBWsJX3UF7cmBRQueGelqc0Rucl3FWhZtbg0UljunDYRDJW3r9PadbpHwzrMiZJV5zAOFPeA-NAbc0qrmrERhFs4LFAOLUp8m7qbbRDc1Q',
          'Accept'       : 'application/json'
              }
                                        }
                                    );

      console.log('this is the url generated, ', url);
      console.log('this is the api response ', apiResponse); 
      let humanResponse = await apiResponse.json();
          
      responseArray.push({id : batch[it].airtableID, fileName: humanResponse.name, tl: humanResponse.thumbnailLink});

      //};     
      console.log("this is the API response array", responseArray);
      console.log(batch[it].airtableID);

      await selectTable.updateRecordsAsync([{id : responseArray[it].id, fields:{'filename' : responseArray[it].fileName,
                                                                                //'Status' : 'ok',
                                                                                'Thumbnail': [{                                   
                                                                                                "filename" : responseArray[it].fileName,
                                                                                                "url"      : responseArray[it].tl
                                                             }]
      
      }}]);
  
          
    };
 recordsNeedThumbNail = recordsNeedThumbNail.slice(50);
    output.text(`Updated ${totalNumberNeedThumbNail-recordsNeedThumbNail.length}/${totalNumberNeedThumbNail} records`);
};

  /*}
    //create batch of records to update
    let updateRecords =[];
    for (let i = 0; i < batch.length; i++) {

        updateRecords.push(batch[i].airtableID, 

   
                          
    //update airtable for empty records
    await selectTable.updateRecordsAsync(updateRecords);
     }   
//}; */
   
    counter++;
