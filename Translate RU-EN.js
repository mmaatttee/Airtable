// Select table
let selectTable = base.getTable('Translation');

// Select view
let currentView = selectTable.getView('All');

// Get source fields
let sourceFields = ["Use of Funds", "Funding Information", "Thank you note Text"];
let targetFields = ["Use of Funds Translated","Funding Information Translated", "Thank you note Text - translated"]
console.log(sourceFields);

//set counter for total
let counter = 0;

//get records for Name and selected Language only from All view only
let sourceRecords = await currentView.selectRecordsAsync({fields:["Use of Funds", "Funding Information", "Thank you note Text","Use of Funds Translated","Funding Information Translated", "Thank you note Text - translated"]}); 

//select records for Use of Funds
  let nonEmptyRecordsUoF = sourceRecords.records.filter(record => {
      let source = record.getCellValue("Use of Funds");
      let targetUoF = record.getCellValue("Use of Funds Translated");
      // this below returns the non-Empty records in Use of Funds      
      return !targetUoF && source;
  });
console.log("Number of non-empty Use of Funds records is ", nonEmptyRecordsUoF.length);

let nonEmptyRecordsFI = sourceRecords.records.filter(record => {
      let source = record.getCellValue("Funding Information");
      let targetFI = record.getCellValue("Funding Information Translated");
      
      return !targetFI && source;
  });
console.log("Number of non-empty Financial Info records is ", nonEmptyRecordsFI.length);

let nonEmptyRecordsTU = sourceRecords.records.filter(record => {
      
      let source = record.getCellValue("Thank you note Text");
      let targetTU = record.getCellValue("Thank you note Text - translated");
      
      return !targetTU && source;
  });
console.log("Number of non-empty Thank You Note records is ", nonEmptyRecordsTU.length);

  //convert to simple array with records to transliterate #1 (Use of Funds)
  let recordsToTranslateUoF =  [];
  let recordsToTranslateFI =  [];
  let recordsToTranslateTU =  [];

  for (let record of nonEmptyRecordsUoF)
  {
      recordsToTranslateUoF.push({
        "id" : record.id,
         "Tfield" : "Use of Funds Translated",
        "name" : record.getCellValue("Use of Funds")
      });
  }

//convert to simple array with records to transliterate #2 (Funding Information)
  for (let record of nonEmptyRecordsFI)
  {
      recordsToTranslateFI.push({
        "id" : record.id,
        "Tfield" : "Funding Information Translated",
        "name" : record.getCellValue("Funding Information")
      });
  }

//convert to simple array with records to transliterate #3 (City)
  for (let record of nonEmptyRecordsTU)
  {
      recordsToTranslateTU.push({
        "id" : record.id,
        "Tfield" : "Thank you note Text - translated",
        "name" : record.getCellValue("Thank you note Text")
      });
  }

  let recordsToTranslate = recordsToTranslateUoF.concat(recordsToTranslateFI, recordsToTranslateTU);
  console.log("Total number of records to translate is ", recordsToTranslate.length);

//prepare variables for http fetch request to API
  let q = [];
  let key = "AIzaSyA2-tzLyh8hUozMtxGvts37n8eNIgK4Nrw";
  let source = "uk";
  let target = "en";
  let url=`https://translation.googleapis.com/language/translate/v2?format=text&source=${source}&key=${key}&target=${target}`; //pick language feature

// batch translate and update records in increments of 50 -  UoF
  while (recordsToTranslateUoF.length > 0) {

    //prepare batch of 10
    let batch = recordsToTranslateUoF.slice(0, 50);
    q = batch.map(recordsToTranslateUoF => recordsToTranslateUoF.name);
    output.inspect(batch);

// json for fetch request
    let datax = {
        "q": q
    };

    let apiResponse = await fetch(url,{
        method: 'POST',
        mode: 'cors',
    body: JSON.stringify(datax)
    },
                                );

    console.log(apiResponse);

    let humanResponse = await apiResponse.json();
    humanResponse = humanResponse.data.translations;
    console.log("This is the API Translation for UoF",humanResponse);

    //create batch of records to update
        let updateRecords =[];
        for (let i = 0; i < batch.length; i++) {

          updateRecords.push({
            id: batch[i].id,
            fields : {
                        "Use of Funds Translated" : humanResponse[i].translatedText
                    }
                            });
                                                }

    //update airtable for empty records
        await selectTable.updateRecordsAsync(updateRecords);
        recordsToTranslateUoF = recordsToTranslateUoF.slice(50);
  }

// batch translate and update records in increments of 50 -  FI
  while (recordsToTranslateFI.length > 0) {

    //prepare batch of 10
    let batch = recordsToTranslateFI.slice(0, 50);
    q = batch.map(recordsToTranslateFI => recordsToTranslateFI.name);
    output.inspect(batch);

// json for fetch request
let datax = {
    "q": q
};

let apiResponse = await fetch(url,{
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(datax)
    },
);

console.log(apiResponse);

let humanResponse = await apiResponse.json();
humanResponse = humanResponse.data.translations;
console.log(humanResponse);

//create batch of records to update
    let updateRecords =[];
    for (let i = 0; i < batch.length; i++) {

      updateRecords.push({
        id: batch[i].id,
        fields : {
                    "Funding Information Translated" : humanResponse[i].translatedText
                 }
                         });
                                            }

//update airtable for empty records
    await selectTable.updateRecordsAsync(updateRecords);
    recordsToTranslateFI = recordsToTranslateFI.slice(50);

  }

// batch translate and update records in increments of 50 -  TU
  while (recordsToTranslateTU.length > 0) {

    //prepare batch of 10
    let batch = recordsToTranslateTU.slice(0, 50);
    q = batch.map(recordsToTranslateTU => recordsToTranslateTU.name);
    output.inspect(batch);

// json for fetch request
let datax = {
    "q": q
};

let apiResponse = await fetch(url,{
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(datax)
    },
);

console.log(apiResponse);

let humanResponse = await apiResponse.json();
humanResponse = humanResponse.data.translations;
console.log(humanResponse);

//create batch of records to update
    let updateRecords =[];
    for (let i = 0; i < batch.length; i++) {

      updateRecords.push({
        id: batch[i].id,
        fields : {
                    "Thank you note Text - translated" : humanResponse[i].translatedText
                 }
                         });
                                            }

//update airtable for empty records
    await selectTable.updateRecordsAsync(updateRecords);
    recordsToTranslateTU = recordsToTranslateTU.slice(50);

  }
