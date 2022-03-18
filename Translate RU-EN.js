//select source langauge using ISO 2 letter code
let source = "en";

// Translate API key
let key="OURAPIKEY";  // <= change your API here

// Select table
let table = base.getTable('Family');

// Select view
let currentView = table.getView('Need Translation');

// Get language list from columns
let fields = [];
for (let field of table.fields) {
    if (field.name == "Use of Funds Translated"){
      fields.push(field.name);
    }
    
}
console.log(fields);

//set counter for total
let counter = 0;

//iterate over all columns/fields with all languages
for (let field of fields){

  //get records data for Name and selected Language only
  //let records = await table.selectRecordsAsync({fields:["Use of Funds", field]});
  //get records from Need Translation view only
  let records = await currentView.selectRecordsAsync({fields:["Use of Funds", "Use of Funds Translated"]});

  //select records for selected language where language field is empty and 
  //text _code(translation text) exists
  let nonEmptyRecords = records.records.filter(record => {
      // this below is if we want to translate from different languages
      let target = record.getCellValue(field);
      // this below is if we want to translate to different languages
      let source = record.getCellValue('Use of Funds');
      return !target && source;
  });
console.log(nonEmptyRecords.length);

  //convert to simple array with records to translate
  let recordsToTranslate =  [];

  for (let record of nonEmptyRecords)
  {
      recordsToTranslate.push({
        "id" : record.id,
        "name" : record.getCellValue("Use of Funds")
      });
  }
  let totalNumberToTranslate = recordsToTranslate.length;
  if (totalNumberToTranslate === 0) {
  continue;
  }
 

  //prepare variables for http fetch request to API
  let q = [];
  let target = "en";
  let url=`https://translation.googleapis.com/language/translate/v2?format=text&${source}=en&key=${key}&target=${target}`;

  // batch translate and update records in increments of 10
  while (recordsToTranslate.length > 0) {

    //prepare batch of 10
    let batch = recordsToTranslate.slice(0, 10);
    q = batch.map(recordsToTranslate => recordsToTranslate.name);

    // json for fetch request
    let data = {
        "q": q
    };

    //fetch POST request with all params
    let apiResponse = await fetch(url,{
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //credentials: 'same-origin', // include, *same-origin, omit
        //headers: {
        //  'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        //},
        // redirect: 'follow', // no redirects in Airtable automation scripts
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      });


    //extract translation array from the response
    let response = await apiResponse.json();
    response = response.data.translations;

    //create batch of records to update
    let updateRecords =[];
    for (let i = 0; i < batch.length; i++) {

      updateRecords.push({
        id: batch[i].id,
        fields: { 
              [field]: response[i].translatedText
        }
      });


    }

    //update airtable for empty records
    await table.updateRecordsAsync(updateRecords);
    recordsToTranslate = recordsToTranslate.slice(10);
  }

 counter++; 
}
