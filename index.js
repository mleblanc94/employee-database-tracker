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

function viewRoles() {
    const getRoles = `SELECT role.id, role.title, role.salary, department.dep_name 
    FROM role INNER JOIN department ON role.department_id = department.id;`;
    db.query(getRoles, (err, results) => {
        if (err) throw err;
        console.table(results)
    })
}

async function menu() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What action would you like to perform?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update employee role']
        },
    ]);

    switch (action) {
        // Code for viewing all of the departments
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
        const queryRoles = `SELECT role.id, role.title, role.salary, department.dep_name 
        FROM role INNER JOIN department ON role.department_id = department.id;`;
        const roles = await queryAsync(queryRoles);
        console.table(roles);
        menu();
        break;
        // Code for viewing all employees
    case 'View all employees':
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
            // Extract department information from query results
            const departments = results.map((row) => ({
                name: row.dep_name,
                id: row.id,
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
                    choices: departments, // Use the extracted department data
                }
            ]).then(async (answers) => {
                const { roleName, salary, roleDepartment } = answers;
                console.log(roleDepartment);
                const addRole = `INSERT INTO role (title, salary, department_id) VALUES ('${roleName}', '${salary}', '${roleDepartment.id}');`;
                db.query(addRole, (err, results) => {
                    if (err) {
                        console.error('Error adding role to database:', err);
                    } else {
                        console.log('Successfully added the role to the database');
                    }
                    menu();
                });
            });
        }
    });
    break;
    }}

menu();