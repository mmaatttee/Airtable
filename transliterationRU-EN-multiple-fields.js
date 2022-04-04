/*******************************************************************************
Title: Cyricllic Transliteration
Author: Matteo Cossu, function by Jamie 'Dubs' Wilkinson
Date Created: March 17, 2022
Version: 2.1
Copyright (c) 2022 by Matteo Cossu, Jamie 'Dubs' Wilkinson
Usage License: MIT License
## Description
This script was coded for the 1kProject Ukraine and designed for use in the Scripting Block of an
(Airtable)[airtable.com] database.
It transliterates batches of blank records from a field-selected table.
## Airtable Requirements
- Scripting Block installed
- Editor or higher permissions
## How To Use This Script
1. Open an Airtable base with the Scripting Block installed.
2. Copy and paste this script into the code editor.
3. Run the script and follow the instructions.
This script requires to comment out all output and console.log's if to be used within an Automation.
This script requires no changes to the structure of the database.
********************************************************************************
********************************************************************************/

//Transliterate function
  function tlCyrillic(text) {
    if(!text) return null;

    const output = text.split('').map(function (char) {
        if(cyrillicToLatin[char] == '') return ''; // allow removing characters
        return cyrillicToLatin[char] || char; // but if we don't have a transliteration, use the original character
    }).join("");

    return output.charAt(0).toUpperCase() + output.slice(1);;
}

const cyrillicToLatin = {
  "Ё":"Yo",
  "Й":"I",
  "Ц":"Ts",
  "У":"U",
  "К":"K",
  "Е":"E",
  "Н":"N",
  "Г":"G",
  "Ш":"Sh",
  "Щ":"Sch",
  "З":"Z",
  "Х":"Kh",
  "х":"kh",
  "Ъ":"'",
  "ё":"yo",
  "й":"i",
  "ц":"ts",
  "у":"u",
  "к":"k",
  "е":"e",
  "н":"n",
  "г":"g",
  "ш":"sh",
  "щ":"sch",
  "з":"z",
  // "ъ":"'",
  "ъ":"",
  "Ф":"F",
  "Ы":"I",
  "В":"V",
  "А":"a",
  "П":"P",
  "Р":"R",
  "О":"O",
  "Л":"L",
  "Д":"D",
  "Ж":"Zh",
  "Э":"E",
  "ф":"f",
  "ы":"i",
  "в":"v",
  "а":"a",
  "п":"p",
  "р":"r",
  "о":"o",
  "л":"l",
  "д":"d",
  "ж":"zh",
  "э":"e",
  "Я":"Ya",
  "Ч":"Ch",
  "С":"S",
  "М":"M",
  // "И":"I",
  "И":"Y",
  // "и":"i",
  "и":"y",
  "Т":"T",
  //"Ь":"'",
  "Ь":"",
  // "ь":"'",
  "ь":"",
  "Б":"B",
  "Ю":"Yu",
  "я":"ya",
  "ч":"ch",
  "Є":"E",
  "є":"e",
  "с":"s",
  "м":"m",
  "т":"t",
  "б":"b",
  "ю":"yu",
  "і":"i",
  "ї":"i",
  "І": "I",
  "і": "o",
};



// Select table
let table = base.getTable('TransLit');

// Select view
let currentView = table.getView('Need Transliteration');

// Get language list from columns
let sourceFields = ["First Name", "Last Name", "City"];
let targetFields = ["firstNameTL","lastNameTL", "cityTL"]
console.log(sourceFields);

//set counter for total
let counter = 0;

//iterate over all fields with all languages
//for (let field of sourceFields){

  //get records for Name and selected Language only from Need Transliteration view only
  let sourceRecords = await currentView.selectRecordsAsync({fields:["First Name", "Last Name", "City","firstNameTL","lastNameTL", "cityTL"]}); 

  //select records for selected language where language field is empty and text _code(translation text) exists
  let nonEmptyRecordsFirstName = sourceRecords.records.filter(record => {
      // this below is if we want to translate from different languages
      let source = record.getCellValue("First Name");
      let targetFirstName = record.getCellValue("firstNameTL");
      // this below is if we want to translate to different languages
      
      return !targetFirstName && source;
  });
console.log(nonEmptyRecordsFirstName.length);

let nonEmptyRecordsLastName = sourceRecords.records.filter(record => {
      let source = record.getCellValue("Last Name");
      let targetLastName = record.getCellValue("lastNameTL");
      
      return !targetLastName && source;
  });
console.log(nonEmptyRecordsLastName.length);

let nonEmptyRecordsCity = sourceRecords.records.filter(record => {
      
      let source = record.getCellValue("City");
      let targetCity = record.getCellValue("cityTL");
      
      return !targetCity && source;
  });
console.log(nonEmptyRecordsCity.length);

  //convert to simple array with records to transliterate #1 (First Name)
  let recordsToTransliterateFN =  [];
  let recordsToTransliterateLN =  [];
  let recordsToTransliterateCity =  [];

  for (let record of nonEmptyRecordsFirstName)
  {
      recordsToTransliterateFN.push({
        "id" : record.id,
         "ATfield" : "firstNameTL",
        "name" : record.getCellValue("First Name")
      });
  }

//convert to simple array with records to transliterate #2 (Last Name)
  for (let record of nonEmptyRecordsLastName)
  {
      recordsToTransliterateLN.push({
        "id" : record.id,
        "ATfield" : "lastNameTL",
        "name" : record.getCellValue("Last Name")
      });
  }

//convert to simple array with records to transliterate #3 (City)
  for (let record of nonEmptyRecordsCity)
  {
      recordsToTransliterateCity.push({
        "id" : record.id,
        "ATfield" : "cityTL",
        "name" : record.getCellValue("City")
      });
  }

  let recordsToTransliterate = recordsToTransliterateFN.concat(recordsToTransliterateLN, recordsToTransliterateCity);
  let totalNumberToTransliterate = recordsToTransliterate.length;
  console.log(totalNumberToTransliterate);

  // batch transliterate and update records in increments of 10
  while (recordsToTransliterateFN.length > 0) {

    //prepare batch of 10
    let batch = recordsToTransliterateFN.slice(0, 10);
    let subBatch1 = batch.filter(subBatch1 => subBatch1.ATfield = "firstNameTL");
    let dataText1 = subBatch1.map(recordsToTransliterateFN => recordsToTransliterateFN.name);
    console.log(dataText1);
  
      //translilterate 10 records from batch
    for (let i = 0; i < subBatch1.length; i++) {
            
              let transLit1 = tlCyrillic(dataText1[i]);
              await table.updateRecordAsync(subBatch1[i].id,{"firstNameTL": transLit1})
    }
    recordsToTransliterateFN = recordsToTransliterateFN.slice(10);
}
while (recordsToTransliterateLN.length > 0) {
  
    let batch = recordsToTransliterateLN.slice(0, 10);
    let subBatch2 = batch.filter(subBatch => subBatch.ATfield = "lastNameTL");
    let dataText2 = subBatch2.map(recordsToTransliterateLN => recordsToTransliterateLN.name);
    for (let it = 0; it < subBatch2.length; it++) {
            
              let transLit2 = tlCyrillic(dataText2[it]);
              await table.updateRecordAsync(subBatch2[it].id,{"lastNameTL": transLit2})
    }
      recordsToTransliterateLN = recordsToTransliterateLN.slice(10);
}
while (recordsToTransliterateCity.length > 0) {
    let batch = recordsToTransliterateCity.slice(0, 10);
    let subBatch3 = batch.filter(subBatch3 => subBatch3.ATfield = "cityTL");
    let dataText3 = subBatch3.map(recordsToTransliterateCity => recordsToTransliterateCity.name);
    for (let itn = 0; itn < subBatch3.length; itn++) {
            
              let transLit3 = tlCyrillic(dataText3[itn]);
              await table.updateRecordAsync(subBatch3[itn].id,{"cityTL": transLit3})
    }
    recordsToTransliterateCity = recordsToTransliterateCity.slice(10);
}
