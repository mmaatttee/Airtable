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
                                                      'X-AC-Auth-Token': 'XXXXX',
                                                      'Accept'         : 'application/json'
                                                     }
                                          });
  let humanResponse = await apiResponse.json();
  console.log(humanResponse.items[0].id, humanResponse.items[0].order_id);
// call API with the order_id and create a s.o. record for every [i]

for (let i = 0; i < humanResponse.total_count; i++) {
  await selectTable.createRecordsAsync([
    {
        fields: {
            "Product": [{id: productDict[`${humanResponse.items[i].item_number}`]}],

        },
    },
    {
        fields: {
            "Sales Order Date": humanResponse.items[i].created_at,
        },
    },
    {
        fields: {
            "ItemQuantity": humanResponse.items[i].quantity,
        },
    },
    {
        fields: {
            "s.o. item ID": humanResponse.items[i].id,
        },
    },
    {
        fields: {
            "s.o. order ID": humanResponse.items[i].order_id,
        },
    },
    {
        fields: {
            "Discount Amount": humanResponse.items[i].discount_amount,
        },
    },
    {
        fields: {
            "ItemUnitPrice": humanResponse.items[i].price,
        },
    },
]);
  console.log(productDict[`${humanResponse.items[i].item_number}`]);
  
}
