// edit these values to match current base
let selectTable = base.getTable("ASIN");
let currentView = selectTable.getView('TEMP');

//set counter for total
let errCounter = 0;

let bRec = await input.recordAsync('Choose a record', selectTable);

let cellBarcode = bRec.getCellValue('Barcode')
output.markdown(`# You have selected ${cellBarcode}.`);


//prepare variables for http fetch request to
let url=`https://api.barcodespider.com/v1/lookup?upc=${cellBarcode}`;
let apiResponse = await remoteFetchAsync(url,{
                                            method: "get",
                                            headers: {
                                                      'token'  : 'XXXX',
                                                      'Accept' : 'application/json'
                                                     }
                                          }
                                      );

console.log('this is the url generated, ', url);
console.log('this is the api response ', apiResponse); 
      
let humanResponse = await apiResponse.json();
console.log('this is the human response ', bRec.id, humanResponse);
if (apiResponse.status === 200) {
                                 await selectTable.updateRecordsAsync([{id : bRec.id, fields:{'ASIN' : humanResponse.item_attributes.asin}}]);
                                 }
else { 
       errCounter++; 
       console.log('API returned Error!',  'UPC =', bRec.id,  'due to', humanResponse.item_response.status, humanResponse.item_response.message);
       await selectTable.updateRecordsAsync([{id : bRec.id, fields:{'ASIN' : humanResponse.item_response.message}
                                           }]);
       }
                 
            
   
