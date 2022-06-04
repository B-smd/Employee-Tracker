// Import and require mysql2
const mysql = require('mysql2');
const inquirer = require("inquirer");
const cTable = require("console.table");

require('dotenv').config()
// Connect to database
const connection = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // MySQL password
      password: process.env.DB_PASSWORD,
      database: 'employee_db'

    },
    console.log(`Connected to the employee_db database.`)
  );
  
  connection.connect(err => {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId);
    afterConnection();
  });

  afterConnection = () => {
    console.log("Employee Tracker");
    promptUser();
  };
const promptUser = () => {
    inquirer.prompt([
    {
    type: "list",
    message: "What would you like to do today?",
    name: "choices",
    choices: ["View All Departments",
            "View All Roles",
            "View All Employees", 
            "Add a Department",
            "Add a Role",
            "Add an Employee",
            "Update an Employee Role",
            "Update Employee Managers",
            "View All Employees by Manager",
            "View All Employees by Department",
            "Delete Departments",
            "Delete Roles",
            "Delete Employees",
            "View Department Budgets",
            "Exit"]
          }
        ]).then((answers) => {
            const { choices } = answers; 
            if (choices === "View All Department") {
              showDepartments();
            }              
            if (choices === "View All Roles") {
              showRoles();
            }              
            if (choices === "View All Employees") {
              showEmployees();
            }              
            if (choices === "Add a Department") {
              addDepartment();
            }              
            if (choices === "Add a Role") {
              addRole();
            }              
            if (choices === "Add an Employee") {
              addEmployee();
            }              
            if (choices === "Update an Employee Role") {
              updateEmployee();
            }              
            if (choices === "Update Employee Managers") {
              updateManager();
            }              
            if (choices === "View Employee by Managers") {
              employeeManager();
            }              
            if (choices === "View Employee by Department") {
              employeeDepartment();
            }              
            if (choices === "Delete a Department") {
              deleteDepartment();
            }              
            if (choices === "Delete a role") {
              deleteRoles();
            }              
            if (choices === "Delete an Employee") {
              deleteEmployees();
            }              
            if (choices === "View Department Budgets") {
              viewBudget();
            }              
            if (choices === "Exit") {
              connection.end();
          };              
    })
};

// VIEW ALL DEPARTMENTS
showDepartments = () => {
  console.log('Showing all departments...\n')
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      promptUser();
  });
};

// VIEW ALL ROLES 
showRoles = () => {
  console.log('Showing all roles...\n')
  const sql = `SELECT role.id, role.title department.name AS department FROM role
               INNER JOIN department  ON role.department_id = department.id`;
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      promptUser();
  });
};

// VIEW ALL EMPLOYEES
showEmployees = () => {
  console.log('Showing all employees...\n')
  const sql = `SELECT employee.id, employee.first_name, employee.last_name,
                      role.title, department.name AS department, role.salary,
                      CONCAT (manager.first_name, " ", manager.last_name) AS manager
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role..department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      promptUser();
  });
};

// ADD DEPARTMENT
addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'addDept',
      message: "What department do you want to add",
      validate: addDept => {
        if (addDept) {
          return true;
        } else {
          console.log('Please enter a department');
          return false;
        }
      }
    }
  ]).then(answer => {
    const sql = `INSERT INTO department (name) VALUES (?)`;
    connection.query(sql, answer.addDept, (err, result) => {
      if (err) throw err
      console.log('Added' + answer.addDept + "to departments!");
      showDepartments();
      });
    });
};             
                      
// ADD ROLE
addRole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'role',
      message: "What Role do you want to add?",
      validate: addRole => {
        if (addRole) {
          return true;
        } else {
          console.log('Please enter a Role');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: "What is the salary of this Role?",
      validate: addSalary => {
        if (isNAN(addSalary)) {
          return true;
        } else {
          console.log('Please enter a salary');
          return false;
        }
      }
    }
  ]).then(answer => {
    const params = [answer.role, answer.salary];

    const roleSql = `SELECT name, id FROM department`;
    connection.promise().query(roleSql, (err, data) => {
      if (err) throw err;
      const dept = data.map(({ name, id}) => ({ name: name, value: id}));
      inquirer.prompt([
        {
          type: 'list',
          name: 'dept',
          message: "What Department is this Role in",
          choices: dept
        }
      ]).then(deptChoice => {
        const dept = deptChoice.dept;
        params.push(dept);
        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
        connection.query(sql, params, (err, result) => {
          if (err) throw err;
          console.log('Added' + answer.role + "to roles!");
          showRoles();
        });
      });
    });
  });
};  

// ADD EMPLOYEES
addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: "What is the employee's first name?",
      validate: addFirst => {
        if (addFirst) {
          return true;
        } else {
          console.log('Please enter a first name');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the employee's last name?",
      validate: addLast => {
        if (addLast) {
          return true;
        } else {
          console.log('Please enter a last name');
          return false;
        }
      }
    }
  ]).then(answer => {
    const params = [answer.firstName, answer.lastName];

    const roleSql = `SELECT role.id, role.title FROM role`;
    connection.promise().query(roleSql, (err, data) => {
      if (err) throw err;
      const roles = data.map(({ id, title }) => ({ name: title, value: id}));
      
      inquirer.prompt([
      {
        type: "list",
        name: "role",
        message: "What is the employee's role? ",
        choices: roles
      }
    ]).then(roleChoice => {
      const role = roleChoice.role;
      params.push(role);
  
      const managerSql = `SELECT * FROM emloyee`;
      connection.promise().query(managerSql, (err, data) => {
        if (err) throw err;
        const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id}));
  
        inquirer.prompt([
          {              
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: managers
          }
      
        ]).then(managerChoice => {
          const manager = managerChoice.manager;
          params.push(manager);
      
          const Sql = `INSERT INTO (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
          connection.query(sql, params, (err, result) => {
            if (err) throw err;
            console.log("Employee has been added!") 
            showEmployees(); 
          });
        });
      });
    });
 });
});
}; 
    
// UPDATE AN EMPLOYEE ROLE
updateEmployee = () => {
  const employeeSql = `SELECT * FROM employee`;
  connection.promise().query(employeeSql, (err, data) => {
    if (err) throw err;
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id}));
  
    inquirer.prompt([
      {              
        type: "list",
        name: "name",
        message: "Which employee would you like to update?",
        choices: employees
      }
    ]).then(empChoice => {
      const employee = empChoice.name;
      const params = [];
      params.push(employee);
  
      const roleSql = `SELECT * FROM role`;
      connection.promise().query(roleSql, (err, data) => {
        if (err) throw err;
        const roles = data.map(({id, title}) => ({ name: title, value: id}));

        inquirer.prompt([
          {              
            type: "list",
            name: "role",
            message: "What is the employee's new role?",
            choices: roles
          }
        ]).then(roleChoice => {
          const role = roleChoice.role;
          params.push(role);
          let employee = params[0]
          params[0] = role
          params[1] = employee
          const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
          connection.query(sql, params, (err, result) => {
            if (err) throw err;
          console.log("Employee has been updated");
          showEmployees();
        });
      });
    });
  });
});
};

// UPDATE EMPLOYEE MANAGERS
updateManager = () => {
  const employeeSql = `SELECT * FROM employee`;
  connection.promise().query(employeeSql, (err, data) => {
    if (err) throw err;
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id}));
  
    inquirer.prompt([
      {              
        type: "list",
        name: "name",
        message: "Which Managers would you like to update?",
        choices: employees
      }
    ]).then(empChoice => {
      const employee = empChoice.name;
      const params = [];
      params.push(employee);
      const managerSql = `SELECT * FROM employee`;
      connection.promise().query(managerSql, (err, data) => {
        if (err) throw err;
      const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id}));
      inquirer.prompt([
        {              
          type: "list",
          name: "manager",
          message: "Which Managers would you like to update?",
          choices: managers
        }
      ]).then(managerChoice => {
        const manager = managerChoice.manager;
        params.push(manager);
        let employee = params[0]
        params[0] = manager
        params[1] = employee
        const Sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
        connection.query(sql, params, (err, result) => {
          if (err) throw err;
        console.log("Employee has been updated");
        showEmployees();
  
    });
  });
});
});
});
};

// VIEW EMPLOYEE BY DEPARTMENT
employeeDepartment = () => {
  console.log('Showing employees by departments...\n')
  const sql = `SELECT employee.first_name, employee.last_name,
                      department.name AS department
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      promptUser();
  });
};

// DELETE DEPARTMENT
deleteDepartment = () => {
  const deptSql = `SELECT * FROM department`;
  connection.promise().query(deptSql, (err, data) => {
    if (err) throw err;
    const dept = data.map(({ name, id }) => ({ name: name, value: id}));
  
    inquirer.prompt([
      {              
        type: "list",
        name: "dept",
        message: "What Department do you want to delete?",
        choices: dept
      }
    ]).then(deptChoice => {
      const dept = deptChoice.dept;
      const sql = `DELETE FROM department WHERE id = ?`;
      connection.query(sql, dept, (err, result) => {
        if (err) throw err;
        console.log("Successfully deleted!") 
        showDepartments(); 
      });
    });
  });
};

// DELETE ROLE
deleteRole = () => {
  const roleSql = `SELECT * FROM role`;
  connection.promise().query(roleSql, (err, data) => {
    if (err) throw err;
    const role = data.map(({ title, id }) => ({ name: title, value: id}));
  
    inquirer.prompt([
      {              
        type: "list",
        name: "role",
        message: "What Role do you want to delete?",
        choices: role
      }
    ]).then(roleChoice => {
      const role = roleChoice.role;
      const sql = `DELETE FROM role WHERE id = ?`;
      connection.query(sql, role, (err, result) => {
        if (err) throw err;
        console.log("Successfully deleted!") 
        showRoles(); 
      });
    });
  });
};

// DELETE EMPLOYEES
deleteEmployee = () => {
  const employeeSql = `SELECT * FROM employee`;
  connection.promise().query(employeeSql, (err, data) => {
    if (err) throw err;
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id}));
  
    inquirer.prompt([
      {              
        type: "list",
        name: "name",
        message: "Which Employee do you want to delete?",
        choices: employees
      }
    ]).then(empChoice => {
      const  employee = empChoice.name;
      const sql = `DELETE FROM employee WHERE id = ?`;
      connection.query(sql, employee, (err, result) => {
        if (err) throw err;
        console.log("Successfully deleted!") 
        showEmployees(); 
      });
    });
  });
};

// DEPARTMENT BUDGET
viewBudget= () => {
  console.log('Showing budget by departments...\n')
  const sql = `SELECT department_id AS id,
                      department.name AS department,
                      SUM(salary) AS budget
               FROM role
                      JOIN department ON role.department_id = department.id GROUP BY department_id`;
    connection.promise().query(sql, (err, rows) => {
      if (err) throw err;
      console.table(rows);
      promptUser();
  });
};