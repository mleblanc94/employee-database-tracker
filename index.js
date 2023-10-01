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
    case 'View all roles':
        const queryRoles = `SELECT role.id, role.title, role.salary, department.dep_name 
        FROM role INNER JOIN department ON role.department_id = department.id;`;
        const roles = await queryAsync(queryRoles);
        console.table(roles);
        menu();
        break;
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
    case 'Add a department':
        const { department } = await inquirer.prompt([
            {
                type: 'input',
                name: 'department',
                message: 'Please enter the department you would like to be added:'
            }
        ]);
        const addDepartment = `INSERT INTO department (dep_name) VALUES ('${department}');`
        db.query(addDepartment, (err, results) => {
            if (err) {
                console.error('Error adding a department into the database:', err);
            } else {
                console.table('Department has been added to the database!', results);
            }
            menu();
        })
        break;
    // case 'Add a role': 
    // const { title } = await inquirer.prompt([
    //     {
    //         type: 'input',
    //         name: 'title',
    //         message: 'Please enter the title of this new role:'
    //     }
    // ]);
    // const { salary } = await inquirer.prompt([
    //     {
    //         type: 'input',
    //         name: 'salary',
    //         message: 'Please enter the salary for this new role:'
    //     }
    // ]);
    // const {  }
    }
}

menu();