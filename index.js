const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employee_tracker_db'
    },
    console.log(`Connected to the employee_tracker_db database.`)
)
db.connect(err => {
    if (err) throw err;
    init();
})

const init = () => {
    inquirer.prompt({
        name: "start",
        type: "list",
        message: "Choose an option?",
        choices: [
            "View All Departments",
            "View All Roles",
            "View All Employees",
            "Add Department",
            "Add Role",
            "Add Employee",
            "Update Employee Role",
            "Quit"
        ]
    }).then((answer) => {
        switch (answer.start) {
            case "View All Departments":
                viewDepartments();
                break;

            case "View All Roles":
                viewRoles();
                break;

            case "View All Employees":
                viewEmployees();
                break;

            case "Add Department":
                addDepartment();
                break;

            case "Add Role":
                addRole();
                break;

            case "Add Employee":
                addEmployee();
                break;

            case "Update Employee Role":
                updateRole();
                break;

            case "Quit":
                db.end();
                break;
        }
    });
}


viewEmployees = () => {
    const query = 'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, concat(managers.first_name, \' \', managers.last_name) AS manager FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id LEFT JOIN employee AS managers ON managers.id = employee.manager_id;';
    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results);
        init();
    });
}

addDepartment = () => {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "What is the name of the department?",
            validate: (value) => {
                if (value) {
                    return true;
                } else {
                    console.log("Please enter a department.");
                }
            }
        }
    ]).then(answer => {
        const query = "INSERT INTO department (name) VALUES (?)";
        db.query(query, answer.department, (err, results) => {
            if (err) throw err;
            console.log("Successfully added new department.");
            init();
        });
    });
}


addRole = () => {


    db.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        const departments = results;
        const departmentNames = departments.map(department => department.name);

        inquirer.prompt([
            {
                name: "role",
                type: "input",
                message: "What is the name of the role?",
                validate: (value) => {
                    if (value) {
                        return true;
                    } else {
                        console.log("Please enter a role.");
                    }
                }
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary for the role?",
                validate: (value) => {
                    if (value) {
                        return true;
                    } else {
                        console.log("Please enter a salary for the role.");
                    }
                }
            },
            {
                name: "department",
                type: "list",
                message: "What is the department for the role?",
                choices: departmentNames,
                validate: (value) => {
                    if (value) {
                        return true;
                    } else {
                        console.log("Please enter a department for the role.");
                    }
                }
            }
        ]).then(answer => {
            const query = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
            const deparmentId = departments
                .filter(department => department.name === answer.department)
                .map(department => department.id);
            db.query(query, [answer.role, parseInt(answer.salary), deparmentId], (err, results) => {
                if (err) throw err;
                console.log("Successfully added new role.");
                init();
            });
        });
    });
}


addEmployee = () => {

    db.query('SELECT id, title FROM role', (err, results) => {
        if (err) throw err;
        const roles = results;
        const roleNames = roles.map(role => role.title);

        db.query('SELECT id, first_name, last_name FROM employee', (err, results) => {
            if (err) throw err;
            const employees = results;
            let employeeNames = employees.map(employee => employee.first_name + ' ' + employee.last_name);

            employeeNames.push("No manager");

            inquirer.prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: " employee's first name?",
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            console.log(" employee's first name.");
                        }
                    }
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "employee's last name?",
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            console.log(" employee's last name.");
                        }
                    }
                },
                {
                    name: "role",
                    type: "list",
                    message: " employee's role?",
                    choices: roleNames,
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            console.log("employee's role.");
                        }
                    }
                },
                {
                    name: "manager",
                    type: "list",
                    message: "employee's manager?",
                    choices: employeeNames,
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            console.log("enter the employee's manager.");
                        }
                    }
                }
            ]).then(answer => {
                const query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                const roleId = roles
                    .filter(role => role.title === answer.role)
                    .map(role => role.id);

                let managerId;
                if (answer.manager === "No manager") {
                    managerId = null;
                } else {
                    managerId = employees
                        .filter(employee => (employee.first_name + ' ' + employee.last_name) === answer.manager)
                        .map(manager => manager.id);
                }

                db.query(query, [answer.firstName, answer.lastName, roleId, managerId], (err, results) => {
                    if (err) throw err;
                    console.log("You have added new employee.");
                    init();
                });
            });
        });
    });
}


updateRole = () => {


    db.query('SELECT id, first_name, last_name FROM employee', (err, results) => {
        if (err) throw err;
        const employees = results;
        let employeeNames = employees.map(employee => employee.first_name + ' ' + employee.last_name);


        db.query('SELECT id, title FROM role', (err, results) => {
            if (err) throw err;
            const roles = results;
            const roleNames = roles.map(role => role.title);

            inquirer.prompt([
                {
                    name: "employee",
                    type: "list",
                    message: " the employee you'd like to update?",
                    choices: employeeNames,
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            console.log(" employee to update.");
                        }
                    }
                },
                {
                    name: "role",
                    type: "list",
                    message: " employee's new role?",
                    choices: roleNames,
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            console.log("role for the employee.");
                        }
                    }
                }
            ]).then(answer => {
                const query = "UPDATE employee SET role_id = ? WHERE id = ?";
                const employeeId = employees
                    .filter(employee => (employee.first_name + ' ' + employee.last_name) === answer.employee)
                    .map(employee => employee.id);
                const roleId = roles
                    .filter(role => role.title === answer.role)
                    .map(role => role.id);
                db.query(query, [roleId, employeeId], (err, results) => {
                    if (err) throw err;
                    console.log("You have added new employee.");
                    init();
                });
            });
        });
    });
}