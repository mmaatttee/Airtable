output.markdown('# Creating order items based on packages');

// create our table objects
const order_table = base.getTable('Orders');
const product_table = base.getTable('Products');
const packages_table = base.getTable('Packages');
const orderitems_table = base.getTable('Order Items');

// get all new orders in the submitted view
const submitted_view = order_table.getView('Submitted');
const submitted_orders = await submitted_view.selectRecordsAsync();

// pull all of our packages
const packages = await packages_table.selectRecordsAsync()

// build an array of orders to products
output.markdown('### Setting up');
output.markdown('Building map of packages and product templates');
var packages_products_array = [];
for (let r of packages.records) {
    let temp_products = r.getCellValue('Products');

    packages_products_array[r.id] = temp_products.map((t)=>{
        return t.id;
    }) 
}

output.inspect(packages_products_array);
//let y = 'recq1Y0Tl78IZrlNc';
//let spread = [...packages_products_array[x]];
//console.log('this is spread', spread);
//console.log('this is jeff',packages_products_array[3]);

//console.log(packages_products_array[y][0]);

//console.log(submitted_orders.records[0].getCellValue('Package'));


for (let i of submitted_orders.records) {
    let submitted_orders_package = i.getCellValue('Package');
    console.log('these are the packages related to the submitted orders',submitted_orders_package)
    let x = submitted_orders_package[0].id;
    console.log('this is x',x);
    console.log('these are the products', packages_products_array[x]);
    if (packages_products_array[x] != undefined ) {
        for (let j of packages_products_array[x]) {
            //console.log(j);
            let townes = j;
            console.log(townes);
            await orderitems_table.createRecordAsync({"Orders_ID" : [{id: i.id}], 'Product' : [{id: townes}]});
        }
    }
    else {
        console.log('package not found')
    }

      //  }

 //   }

};
