// AT API key
let APIkey="XXXXXXXXXX";  // <= change your API here

// Define bases Table
let basesTable = base.getTable("Bases");
let tablesTable = base.getTable("Tables");
let viewsTable = base.getTable("Views");
let fieldsTable = base.getTable("Fields");

// ---- BASES

//get Base records 
  let existingBaseRecords = await basesTable.selectRecordsAsync({fields:["BaseID", "BaseName"]}); 

  let existingBases = existingBaseRecords.records.filter(record => {
      let baseIDField = record.getCellValue("BaseID");
      let baseNameField = record.getCellValue("BaseName");
      return baseIDField && baseNameField;
  });
//console.log('these are the existing bases',existingBases);

// create existing bases array
let existingBasesArray = [];
for (let record of existingBases)
  {
      existingBasesArray.push(record.getCellValue('BaseID'));
  }
  //console.log('this is the Base field name array',existingBasesArray);

//let obj = existingBasesArray.find(o => o === 'appstEU0iRMOxfSgm');
//console.log(obj);

// create base dictionary
let baseQuery = await basesTable.selectRecordsAsync();
let baseDict = {};
for (let record of baseQuery.records) {
    baseDict[record.getCellValue('BaseID')] = record.id;
}
console.log('this is the base dictionary', baseDict);

// ---- TABLES

//get Table records 
  let existingTableRecords = await tablesTable.selectRecordsAsync({fields:["TableID", "TableName"]}); 

  let existingTables = existingTableRecords.records.filter(record => {
      let tableIDField = record.getCellValue("TableID");
      let tableNameField = record.getCellValue("TableName");
      return tableIDField && tableNameField;
  });
//console.log('these are the existing tables',existingTables);

// create existing tables array
let existingTablesArray = [];
for (let record of existingTables)
  {
      existingTablesArray.push(record.getCellValue('TableID'));
  }
  //console.log('this is the Table field name array',existingTablesArray);

let tableQuery = await tablesTable.selectRecordsAsync();
let tableDict = {};
for (let record of tableQuery.records) {
    tableDict[record.name] = record.id;
}
console.log('this is the table dictionary', tableDict);


//let obj = existingBasesArray.find(o => o === 'appstEU0iRMOxfSgm');
//console.log(obj);


// ---- VIEWS

//get Views records 
  let existingViewRecords = await viewsTable.selectRecordsAsync({fields:["ViewID", "ViewName"]}); 

  let existingViews = existingViewRecords.records.filter(record => {
      let viewIDField = record.getCellValue("ViewID");
      let viewNameField = record.getCellValue("ViewName");
      return viewIDField && viewNameField;
  });
//console.log('these are the existing views',existingViews);

// create existing views array
let existingViewsArray = [];
for (let record of existingViews)
  {
      existingViewsArray.push(record.getCellValue('ViewID'));
  }
 // console.log('this is the View field name array',existingViewsArray);

//let obj = existingBasesArray.find(o => o === 'appstEU0iRMOxfSgm');
//console.log(obj);

// ---- FIELDS

//get Fields records 
  let existingFieldRecords = await fieldsTable.selectRecordsAsync({fields:["FieldID", "FieldName"]}); 

  let existingFields = existingFieldRecords.records.filter(record => {
      let fieldIDField = record.getCellValue("FieldID");
      let fieldNameField = record.getCellValue("FieldName");
      return fieldIDField && fieldNameField;
  });
//console.log('these are the existing fields',existingFields);

// create existing views array
let existingFieldsArray = [];
for (let record of existingFields)
  {
      existingFieldsArray.push(record.getCellValue('FieldID'));
  }
  //console.log('this is the Field field name array',existingFieldsArray);

//let obj = existingBasesArray.find(o => o === 'appstEU0iRMOxfSgm');
//console.log(obj);

// For every base in the existing base array
// create tables (except those in the existing table array)

for (let b in existingBasesArray) {
  
  let tablesURL = 'https://api.airtable.com/v0/meta/bases/'+existingBasesArray[b]+'/tables';
  console.log(tablesURL);
  //fetch GET request with all params
  let apiResponse = await fetch(tablesURL,{
        method: 'GET', 
        mode: 'cors', 
        headers: {
          'Authorization' : 'Bearer '+ APIkey,
          'Cookie' : 'brw=brwsfryP8co1pEAH2'
                  },
      });

var response = await apiResponse.json();
console.log('these are the existing tables',existingTables);
console.log('this is the Current Base API-found tables', response);
console.log(response.tables);
console.log('this is response.tables[record].id', response.tables[0].id);

//Create array for comparisons
let responseArray = [];
for (let record in response.tables)
  {
    let recordTableID = response.tables[record].id;
    responseArray.push(recordTableID);
  }
  //console.log('this is the Table field name array',existingTablesArray);

//let index = responseArray.indexOf('tblzjm0seEV3KhUjn');
//console.log(index);


//update only new tables
for (let t in response.tables) { 
    let searchObj = response.tables[t].id;
      console.log('this is the API-found current table were looking for', t, searchObj);
    var index = existingTablesArray.indexOf(searchObj);
      console.log('this is the position occupied by the BaseID in the existing tables array', index);
       if (index == -1) { 
        await tablesTable.createRecordAsync({
        "TableName": response.tables[t].name,
        "TableID": response.tables[t].id,
        "Base": [{id: baseDict[`${existingBasesArray[b]}`]}]
        });
        console.log('record created', response.tables[t].name)
      }
      //else continue;
}
}


/*
//update only new tables
//for (let t = 0; t < existingTables.length; t++) {
for (let t in existingTables) { 
    let searchObj = response.tables[t].id;
      console.log('this is the current table', t, response.tables[t]);
      console.log('this is the TableID found in the API response',searchObj);
  var index = existingTablesArray.indexOf(searchObj);
      console.log('this is the position occupied by the BaseID in the API Response array', index);
       if (index == -1) { 
        tablesTable.createRecordAsync({
        "TableName": response.tables[t].name,
        "TableID": response.tables[t].id
        });
      }
      //else continue;
}
}



//update only new views
//for (let b = 0; b < existingTables.length; b++) {
for (let v in existingTables) { 
    let searchObj = response.bases[b].id;
  //console.log('this is the TableID found in the API response',searchObj);
  var index = existingTablesArray.indexOf(searchObj);
  //console.log('this is the position occupied by the BaseID in the API Response array', index);
       if (index == -1) { 
        tablesTable.createRecordAsync({
        "TableName": response.bases[b].name,
        "TableID": response.bases[b].id
        });
      }
      //else continue;
}


}

/*

// Select Table
let basesTable = base.getTable("Bases");
let tablesTable = base.getTable("Tables");
let viewsTable = base.getTable("Views");
let fieldsTable = base.getTable("Fields");
let url = 'https://api.airtable.com/v0/meta/bases/appft68fYGM2Loe9V/tables';

//fetch GET request with all params
let apiResponse = await fetch(url,{
        method: 'GET', 
        mode: 'cors', 
        headers: {
          'Authorization' : 'Bearer '+ key,
          'Cookie' : 'brw=brwsfryP8co1pEAH2'
                  },
      });

let response = await apiResponse.json();
console.log('this is the API response', response);
//console.log(response.tables[0].name);

for (let t in response.tables) { 
    await tablesTable.createRecordAsync({
    "TableName": response.tables[t].name,
    "TableID": response.tables[t].id
                                        });

let tableQuery = await tablesTable.selectRecordsAsync();
let tableDict = {};
for (let record of tableQuery.records) {
    tableDict[record.name] = record.id;
}
console.log('this is the table dictionary', tableDict);

    for (let f in response.tables[t].fields) {
      await fieldsTable.createRecordAsync({
      "FieldName": response.tables[t].fields[f].name,
      "FieldID": response.tables[t].fields[f].id,
      "FieldType": response.tables[t].fields[f].type,
      "Table": [{id: tableDict[`${response.tables[t].name}`]}]
 });
    };
    for (let v in response.tables[t].views) {
      await viewsTable.createRecordAsync({
      "ViewName": response.tables[t].views[v].name,
      "ViewID": response.tables[t].views[v].id,
      "ViewType": response.tables[t].views[v].type,
      "Table": [{id: tableDict[`${response.tables[t].name}`]}]
 });
//console.log(response.tables[t].name);
};
}

/*

// AT API key
let key="keyM5SD6QvPBm0a9W";  // <= change your API here

// Select Table
let basesTable = base.getTable("Bases");
let tablesTable = base.getTable("Tables");
let viewsTable = base.getTable("Views");
let url = 'https://api.airtable.com/v0/meta/bases';

//get records 
  let existingBaseRecords = await basesTable.selectRecordsAsync({fields:["BaseID", "BaseName"]}); 

  let existingBases = existingBaseRecords.records.filter(record => {
      let baseIDField = record.getCellValue("BaseID");
      let baseNameField = record.getCellValue("BaseName");
      return baseIDField && baseNameField;
  });
console.log('these are the existing bases',existingBases);

// create existing bases array
let existingBasesArray = [];
for (let record of existingBases)
  {
      existingBasesArray.push(record.getCellValue('BaseID'));
  }
  console.log('this is the field name array',existingBasesArray);

//let obj = existingBasesArray.find(o => o === 'appstEU0iRMOxfSgm');

//  console.log(obj);


//fetch GET request with all params
let apiResponse = await fetch(url,{
        method: 'GET', 
        mode: 'cors', 
        headers: {
          'Authorization' : 'Bearer keyM5SD6QvPBm0a9W',
          'Cookie' : 'brw=brwsfryP8co1pEAH2'
                  },
      });

let response = await apiResponse.json();
console.log('these are the bases from the API',response);
//console.log(response.bases[0].name);

//update only new bases
//for (let b = 0; b < existingBases.length; b++) {
for (let b in existingBases) { 
    let searchObj = response.bases[b].id;
  //console.log('this is the BaseID found in the API response',searchObj);
  var index = existingBasesArray.indexOf(searchObj);
  //console.log('this is the position occupied by the BaseID in the API Response array', index);
       if (index == -1) { 
        basesTable.createRecordAsync({
        "BaseName": response.bases[b].name,
        "BaseID": response.bases[b].id
        });
      }
      //else continue;
}
  */
