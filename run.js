sql = require("mysql");
inq = require("inquirer");

let inv = [];

var con = sql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: "8889",
    database: "bamazon"
})

con.connect(function(err) {
    if(err) throw err;
    console.log("Connected");
    get();
});

function get() {
    con.query("SELECT * FROM products", function(err, result) {
        if(err) throw err;
        inv = result;
        console.table(inv);
        ask();
    });
}

async function ask() {
    let response = await inq.prompt([
        {
            type: "input",
            message: "What is the id of the item you would like to purchase?",
            name: "id"
        },
        {
            type: "input",
            message: "How many would you like to purchase?",
            name: "quant"
        }
    ]);

    let id = parseInt(response.id);
    let quant = parseInt(response.quant);
    
    for(var i = 0; i < inv.length; i++) {
        if(inv[i].item_id === id) {
            if(inv[i].stock_quantity < quant) {
                console.log("Insufficient quantity!");
                break;
            } 
            else {
                update(id, quant, i);
            }
        }
    }
}

async function cont() {
    let response = await inq.prompt([
        {
            type: "confirm",
            message: "Would you like to make another purchase?",
            name: "cont",
            default: true
        }
    ])

    if(response.cont) {
        get();
    }
    else {
        process.exit();
    }
}

function update(id, quant, index) {
    newQuant = inv[index].stock_quantity - quant;
    inv[index].stock_quantity = newQuant;
    price = inv[index].price;
    set = "UPDATE products SET stock_quantity = " + newQuant + " WHERE item_id = " + id;
    con.query(set, function(err, result) { 
        if(err) throw err;
        console.log("Confirmed, your purchase was a total of $" + (price * quant) + ".");
    });
    newSales = inv[index].product_sales + quant;
    inv[index].product_sales = newSales;
    setTwo = "UPDATE products SET product_salse = " + newSales + " WHERE item_id = " + id;
    con.query(setTwo, function(err, result) { 
        if(err) throw err;
        cont();
    });
}