INSERT INTO department (dep_name)
VALUES ("IT"),
       ("Finance"),
       ("Marketing");
       
INSERT INTO role (title, salary, department_id)
VALUES ('Developer', 80000, 1),
       ('Lead Accountant', 100000, 2),
       ('Marketing Lead', 70000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Jeb', 'Smith', 1, null),
       ('John', 'Smith', 1, 1),
       ('Sammy', 'Smith', 3, null),
       ('Timmy', 'Tuckwell', 2, null);