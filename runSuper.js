inq = require("inquirer");
sql = require("mysql");

let depts = ["All"];

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
    populateDepts();
    ask();
});

function populateDepts() {
    con.query("SELECT * FROM departments", function(err, result) {
        for(var i = 0; i < result.length; i++) {
            depts.push(result[i].department_name);
        }
    });
}

async function ask() {
    let response = await inq.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View Product Sales by Department",
                "Create New Department"],
            name: "choice"
        }
    ]);

    switch(response.choice) {
        case "View Product Sales by Department":
            deptSelect();
            break;
        case "Create New Department":
            createDept();
            break;
    }
}

async function deptSelect() {
    let response = await inq.prompt([
        {
            type: "checkbox",
            message: "Which departments would you like to View Sales for?",
            choices: depts,
            name: "choice"
        }
    ]);

    viewSales(response.choices);
}

function viewSales() {
    let stats = [];
    let let 
    set = "SELECT departments.department_name AS department, departments.over_head_costs AS overhead, products.product_sales AS sales FROM departments JOIN products ON departments.department_name = products.department_name"
    con.query(set, function(err, result) {
        if(err) throw err;
        stats = result;
    })

}

function createDept() {

}

async function cont() {
    let response = await inq.prompt([
        {
            type: "confirm",
            message: "Would you like to do something else?",
            name: "cont",
            default: true
        }
    ]);

    if (response.cont) {
        ask();
    }
    else {
        process.exit();
    }
}