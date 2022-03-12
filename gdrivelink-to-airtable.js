//prepare variables for http fetch request to API
let url=`https://www.googleapis.com/drive/v3/files/1mEi9OswuTwoRHb1jfTeJAE6mgQhZQUBz?fields=name%2C%20hasThumbnail%2C%20thumbnailLink&key={{APIKEY}}`;

let apiResponse = await fetch(url,{
    method: "get",
    headers: {
        'Authorization': 'Bearer ya29.A0ARrdaM8F7RUIOq79uob-NPs09zPpENrypLS_dAj4Si2e27BSo37pbX8hgN1Woq6w6jy7bg0p_qUXytNzV3FMa7vlLrzKy6bQsihog6TsGO7VNq3QucTJ80_6QjP9XUwoekV3QEo_Msph_nD9gNtX3Juk8_tUXA',
        'Accept'       : 'application/json'
    }});


let humanResponse = await apiResponse.json();
let fileName = humanResponse.name;
let picURL = humanResponse.thumbnailLink;
console.log(picURL);

// get the target table
let targetTable = base.getTable("Sandbox");

// set the csv url (in dropbox)
await targetTable.updateRecordAsync("recrzuP3Jyo6hd9vj", {
    //"Name" : "My CSV File",
    //"Rows" : csvItemCount,
    "Thumbnail": [
        {
        "id"       : "attiRJr8Ih9v3etWi",
        "filename" : fileName,
        "url"      : picURL
        }
    ]
}) 
