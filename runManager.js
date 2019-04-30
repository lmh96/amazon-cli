inq = require("inquirer");
sql = require("mysql");

let inv = [];

var con = sql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: "8889",
    database: "bamazon"
})

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected");
    ask();
});

async function ask() {
    let response = await inq.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product",
                "Exit"],
            name: "option"
        }
    ]);

    switch (response.option) {
        case "View Products for Sale":
            viewAll();
            break;
        case "View Low Inventory":
            viewLow();
            break;
        case "Add to Inventory":
            addMore();
            break;
        case "Add New Product":
            addNew();
            break;
        default:
            process.exit();
            break;
    }
}

function viewAll() {
    con.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        inv = result;
        console.table(inv);
        cont();
    });
}

function viewLow() {
    con.query("SELECT * FROM products  WHERE stock_quantity < 10", function (err, result) {
        if (err) throw err;
        if (typeof (inv[0]) === "undefined") {
            console.log("Nothing is low")
        }
        else {
            console.table(inv);
        }
        cont();
    });
}

async function addMore() {
    con.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;
        inv = result;
        console.table(inv);
    });
    let response = await inq.prompt([
        {
            type: "input",
            message: "What is the id of the item you would like to add to?",
            name: "id"
        },
        {
            type: "input",
            message: "How many would you like to add?",
            name: "quant"
        }
    ]);

    id = parseInt(response.id);
    quant = parseInt(response.quant);

    console.log(inv.length);
    for (var i = 0; i < inv.length; i++) {
        if (inv[i].item_id === id) {
            update(id, quant, i);
        }
    }
}

async function addNew() {
    let response = await inq.prompt([
        {
            type: "input",
            message: "What is the name of the item you would like to add?",
            name: "name"
        },
        {
            type: "input",
            message: "What deppartment would you like to add this to?",
            name: "department"
        },
        {
            type: "input",
            message: "What is the price of the item you would like to add?",
            name: "price"
        },
        {
            type: "input",
            message: "How many would you like to add?",
            name: "quant"
        }
    ]);

    name = response.name;
    dept = response.department;
    price = parseFloat(response.price);
    quant = parseInt(response.quant);
    insert(name, dept, price, quant);
}

async function cont() {
    let response = await inq.prompt([
        {
            type: "confirm",
            message: "Would you like to do something else?",
            name: "cont",
            default: true
        }
    ])

    if (response.cont) {
        ask();
    }
    else {
        process.exit();
    }
}

function update(id, quant, index) {
    newQuant = inv[index].stock_quantity + quant;
    inv[index].stock_quantity = newQuant;
    set = "UPDATE products SET stock_quantity = " + newQuant + " WHERE item_id = " + id;
    con.query(set, function (err, result) {
        if (err) throw err;
        console.log("Confirmed, new total is " + inv[index].stock_quantity);
        cont();
    });
}

function insert(product, department, price, quant) {
    set = "INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES (\"" + product + "\", \"" + department + "\", " + price + ", " + quant + ")";
    con.query(set, function (err, result) {
        if (err) throw err;
        console.log("Confirmed, " + quant + " of the item " + product + " have been added to " + department + " for $" + price);
        cont();
    });
}