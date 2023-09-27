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