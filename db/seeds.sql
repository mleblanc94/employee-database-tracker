INSERT INTO department (id, dep_name)
VALUES (001, "IT"),
       (002, "Finance"),
       (003, "Marketing");
       
INSERT INTO role (id, title, salary, department_id)
VALUES (01, 'Developer', 80000, 001),
       (02, 'Lead Accountant', 100000, 002),
       (03, 'Marketing Lead', 70000, 003);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, 'Jeb', 'Smith', 01),
       (2, 'John', 'Smith', 01, 1),
       (3, 'Sammy', 'Smith', 03),
       (4, 'Timmy', 'Tuckwell', 02);