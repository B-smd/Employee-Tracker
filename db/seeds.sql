INSERT INTO department (name)
VALUES ("Sales"),
       ("Accounting"),
       ("Engineer"),
       ("Recruitment");

SELECT * FROM department;

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Manager", 100000, 1),
       ("Sales", 65000, 1),
       ("Accounting Manager", 90000, 2),
       ("Accounting", 70000, 2),
       ("Engineer Manager", 120000, 4),
       ("Engineer", 100000, 4),
       ("HR Manager", 80000, 3),
       ("HR", 70000, 3);

SELECT * FROM role;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("James", "Brian", 1, NULL),
       ("Patricia", "Sarah", 2, 1),
       ("Robert", "Larry", 3, NULL),
       ("Kathleen", "Scott", 4, 2),
       ("Gary", "Tyler", 5, NULL),
       ("Pamela", "Kyle", 6, 3),
       ("Adam", "Noah", 7, NULL),
       ("Walter", "Sean", 8, 4);

SELECT * FROM employee;