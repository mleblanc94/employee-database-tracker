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

        break;
    }
}

menu();