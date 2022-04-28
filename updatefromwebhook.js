let selectTable = base.getTable("s.o. items");

console.log(selectTable.fields);

let inputConfig = input.config();
let list = inputConfig.productsBought;
console.log('the webhook order is ', list, 'items long.')
let orderID = inputConfig.order_id;

let productTable = base.getTable("PRODUCTS");
let productQuery = await productTable.selectRecordsAsync();
let productDict = {};
for (let record of productQuery.records) {
    productDict[record.name] = record.id;
}

let urlItems=`https://www.mindkits.co.nz/api/v1/order_items?order_id=${orderID}`;
let apiResponse = await fetch(urlItems,{
                                            method: "get",
                                            headers: {
                                                      'X-AC-Auth-Token': '262557690032eacfad64023e3494dafb',
                                                      'Accept'         : 'application/json'
                                                     }
                                          });
  let humanResponse = await apiResponse.json();
  console.log('humanresponse id',humanResponse.items[0].id, 'humanresponse order id',humanResponse.items[0].order_id);
// call API with the order_id and create a s.o. record for every [i]

for (let i = 0; i < list; i++) {
    await selectTable.createRecordAsync({"Product": [{id: productDict[`${humanResponse.items[i].item_number}`]}],
                                         "s.o. order ID": humanResponse.items[i].order_id,
                                         "Sales Order Date": humanResponse.items[i].created_at,
                                         "ItemQuantity": humanResponse.items[i].quantity,
                                         "s.o. item ID": humanResponse.items[i].id,
                                         "Discount Amount": humanResponse.items[i].discount_amount,
                                         "ItemUnitPrice": humanResponse.items[i].price});
                                
    console.log('created record with "s.o. item ID" =', humanResponse.items[i].id );  
}
