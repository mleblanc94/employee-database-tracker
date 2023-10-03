// Include the packages needed for this application
const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const fs = require('fs');
const PORT = process.env.PORT || 3001;
const app = express();

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'Werfen2024',
        database: 'employee_db'
    },
    console.log('Successfully connected to the database!')
)

// Query to asynchronously pull results from DB
const queryAsync = (query) => {
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        })
    })
}

// Main function that displays the list of options for the user
async function menu() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What action would you like to perform?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update employee role']
        },
    ]);
    // Beginning of switch statements - determining what action to take based off what the user chooses
    switch (action) {
        // Code for viewing all of the departments by querying from the database using db.query
        case 'View all departments':
            const queryDepartments = `SELECT * FROM department;`
            db.query(queryDepartments, (err, results) => {
                if (err) {
                    console.error('Error retrieving the departments:', err);
                } else {
                    console.table(results);
                }
                menu();
            })
        break;
        // Code for viewing all of the roles
    case 'View all roles':
        // Joins tables of role and department together in order to pull all information that is required
        const queryRoles = `SELECT role.id, role.title, role.salary, department.dep_name 
        FROM role INNER JOIN department ON role.department_id = department.id;`;
        const roles = await queryAsync(queryRoles);
        // Displays the results in the console
        console.table(roles);
        menu();
        break;
        // Code for viewing all employees from the database
    case 'View all employees':
            // Queries and joins the employee, role, and department tables to pull all needed results
        const queryEmployees = `SELECT 
                            e.id AS employee_id, 
                            e.first_name,
                            e.last_name, 
                            r.title AS job_title, 
                            d.dep_name AS department, 
                            r.salary,
                            CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                            FROM
                            employee e JOIN
                            role r ON e.role_id = r.id JOIN
                            department d ON r.department_id = d.id LEFT JOIN
                            employee m ON e.manager_id = m.id;
                            `;
        db.query(queryEmployees, (err, results) => {
            if (err) {
                console.error('Error retrieving the employees:', err);
            } else {
                console.table(results);
            }
            menu();
        })
        break;
        // Code for adding departments into the database
    case 'Add a department':
        const { department } = await inquirer.prompt([
            {
                type: 'input',
                name: 'department',
                message: 'Please enter the name of the department you would like to be added:'
            }
        ]);
        // Adds to the database the new department the user has entered
        const addDepartment = `INSERT INTO department (dep_name) VALUES ('${department}');`
        db.query(addDepartment, (err, results) => {
            if (err) {
                console.error('Error adding a department into the database:', err);
            } else {
                console.log('Department has been added to the database!');
            }
            menu();
        })
        break;
        // Code for adding a role into the database
    case 'Add a role': 
    db.query(`SELECT * FROM department`, (err, results) => {
        if (err) {
            console.error('Error querying departments to allow user to select from:', err);
        } else {
            console.log('Successfully queried departments to allow user to pick from');
            // Extract department information from query results - this is then presented for the user to choose from
            const departments = results.map((data) => ({
                name: data.dep_name,
                value: data.id,
            }));

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'roleName',
                    message: 'Please enter the title of this new role:'
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Please enter the salary for this new role:'
                },
                {
                    type: 'list',
                    name: 'roleDepartment',
                    message: 'Please select which department this role is a part of:',
                    choices: departments
                }
            ]).then(async (answers) => {
                const { roleName, salary, roleDepartment } = answers;
                // Results are inserted into role table based off the users answers
                const addRole = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`;
                db.query(addRole, [roleName, salary, roleDepartment], (err, results) => {
                    if (err) {
                        console.error('Error adding role to database:', err);
                    } else {
                        console.log(`Added role ${roleName} to the database`);
                    }
                    menu();
                });
            });
        }
    });
    break;
    // Case for adding an employee to the database
    case 'Add an employee':
        // Querying everything from roles so the user can choose a role for the new employee
        db.query(`SELECT * FROM role`, (err, results) => {
            if (err) {
                console.error('Error querying departments to allow user to select from:', err);
            } else {
                console.log('Successfully queried departments to allow user to pick from');
                // Extract department information from query results to show to user
                const roles = results.map((roleData) => ({
                    name: roleData.title,
                    value: roleData.id,
                }));

    // Querying everything from employee table
    db.query(`SELECT * FROM employee`, (err, managersResults) => {
        if (err) {
            console.error('There was an error that occurred when querying for the employee table:', err);
        } else {
            console.log('Successfully queried employees to allow users to select which is a manager');
            // Extract employee names from the data while also including an option for None which will insert to the DB as null
            // Also concatnating the managers names to be displayed
            const managers = [
                {name: 'None', value: null}, ...managersResults.map((managerData) => ({
                name: `${managerData.first_name} ${managerData.last_name}`,
                value: managerData.id,
            })),
        ];

    inquirer.prompt([
        {
        type: 'input',
        name: 'firstName',
        message: 'Please enter the first name of the employee you would like added:'
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'Please enter the last name of the employee you would like added:'
        },
        {
            type: 'list',
            name: 'employeeRole',
            message: 'Please select which role this employee has:',
            choices: roles
        },
        {
            type: 'list',
            name: 'employeeManager',
            message: 'Please select which manager this employee has:',
            choices: managers
        }
    ]).then(async (answers) => {
        const { firstName, lastName, employeeRole, employeeManager } = answers;
        const addEmployee = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);`;
        db.query(addEmployee, [firstName, lastName, employeeRole, employeeManager], (err, results) => {
            if (err) {
                console.error('Error adding employee to database:', err);
            } else {
                console.log(`Added ${firstName} ${lastName} to the database`);
            }
            menu();
        });
    });
}
});
    }});
break;
// Case for updating an employees role in database
case 'Update employee role':
    // Pull employees from the database to allow the user to select which ones role to edit
    db.query(`SELECT * FROM employee`, (err, employeeResults) => {
        if (err) {
            console.error('Error getting all employees from the database to select which role to update', err);
        } else {
            console.log('Successfully queried employees to allow users to select which role to update');
            // Extract employee names from the data
            // Captures the employee ID as well as the name to use in UPDATE query
            const employees = employeeResults.map((employeeData) => ({
                name: `${employeeData.first_name} ${employeeData.last_name}`,
                value: employeeData.id,
            }));

            // Pull roles from the database
            db.query(`SELECT * FROM role`, (err, roleResults) => {
                if (err) {
                    console.error('Error retrieving roles from database');
                } else {
                    console.log('Successfully queried roles from database')
                    // Captures the role ID as well as the name to use in UPDATE query
                    const roleUpdates = roleResults.map((rolesToShow) => ({
                        name: rolesToShow.title,
                        value: rolesToShow.id,
                    }))

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeToUpdate',
                    message: 'Please choose an employee from the database to update the role of',
                    choices: employees
                },
                {
                    type: 'list',
                    name: 'updatedRole',
                    message: 'Please select the new role for this employee',
                    choices: roleUpdates
                }
            ]).then(async (answers) => {
                const { employeeToUpdate, updatedRole } = answers;
                const updateEmployee = `UPDATE employee SET role_id = '?' WHERE id = '?';`;
                db.query(updateEmployee, [updatedRole, employeeToUpdate], (err, results) => {
                    if (err) {
                        console.error('Error adding employee to the database:', err);
                    } else {
                        console.log(`Role updated for ${employeeToUpdate}`);
                    }
                    menu();
                });
            });
        }
    });
}
    });
    break;
}
}

menu();