// Import and require mysql2
const mysql = require('mysql2');
const inquirer = require("inquirer");
const cTable = require("console.table");
const { response } = require('express');

require('dotenv').config()
// Connect to database
const connection = mysql.createConnection(
  {
    host: 'localhost',
    port: 3306,
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
        "View Employees by Department",
        "Delete a Department",
        "Delete a role",
        "Delete an Employee",
        "View Department Budgets",
        "Exit"]
    }
  ]).then(async (answers) => {
    const { choices } = answers;
    if (choices === "View All Departments") {
      await showDepartments();
    }
    if (choices === "View All Roles") {
      await showRoles();
    }
    if (choices === "View All Employees") {
      await showEmployees();
    }
    if (choices === "Add a Department") {
      await addDepartment();
    }
    if (choices === "Add a Role") {
      await addRole();
    }
    if (choices === "Add an Employee") {
      await addEmployee();
    }
    if (choices === "Update an Employee Role") {
     await updateEmployee();
    }
    if (choices === "Update Employee Managers") {
      await updateManager();
    }
    if (choices === "View Employees by Managers") {
      await employeeManager();
    }
    if (choices === "View Employees by Department") {
      await employeeDepartment();
    }
    if (choices === "Delete a Department") {
      await deleteDepartment();
    }
    if (choices === "Delete a role") {
      await deleteRole();
    }
    if (choices === "Delete an Employee") {
      await deleteEmployee();
    }
    if (choices === "View Department Budgets") {
      await viewBudget();
    }
    if (choices === "Exit") {
      connection.end();
      process.end();
    };
    promptUser();
  })
};

// VIEW ALL DEPARTMENTS
const showDepartments = () => {
  console.log('Showing all departments...\n')
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;
  return connection.promise().query(sql)
    .then(([rows]) => {
      console.table(rows);
    })
    .catch(error => {
      throw error;
    })
};

// VIEW ALL ROLES 
const showRoles = () => {
  console.log('Showing all roles...\n')
  const sql = `SELECT role.id, role.title, role.salary, department.name AS department FROM role
               INNER JOIN department ON role.department_id = department.id`;
  return connection.promise().query(sql)
    .then(([rows]) => {
      console.table(rows);
    })
    .catch(error => {
      throw error;
    })


};

// VIEW ALL EMPLOYEES
const showEmployees = () => {
  console.log('Showing all employees...\n')
  const sql = `SELECT employee.id, employee.first_name, employee.last_name,
                      role.title, department.name AS department, role.salary,
                      CONCAT (manager.first_name, " ", manager.last_name) AS manager
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`;
  return connection.promise().query(sql)
    .then(([rows]) => {
      console.table(rows);
    })
    .catch(error => {
      throw error;
    })



};


// ADD DEPARTMENT
const addDepartment = () => {
  return inquirer.prompt([
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
    return connection.promise().query(sql, answer.addDept).then(result => {
      
      console.log('Added' + answer.addDept + "to departments!");
      return showDepartments();
    });
  });
};

// ADD ROLE
const addRole = () => {
  return inquirer.prompt([
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
        if (!isNaN(addSalary)) {
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
    return connection.promise().query(roleSql).then ( ([data]) => {
      
      const dept = data.map(({ name, id }) => ({ name: name, value: id }));
      return inquirer.prompt([
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
        return connection.promise().query(sql, params).then(result => {
          
          console.log('Added' + answer.role + "to roles!");
          return showRoles();
        });
      });
    });
  });
};

// ADD EMPLOYEE
const addEmployee = () => {
  return inquirer.prompt([
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
    return connection.promise().query(roleSql).then(([data]) => {
      
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));

      return inquirer.prompt([
        {
          type: "list",
          name: "role",
          message: "What is the employee's role? ",
          choices: roles
        }
      ]).then(roleChoice => {
        const role = roleChoice.role;
        params.push(role);

        const managerSql = `SELECT * FROM employee`;
        return connection.promise().query(managerSql).then( ([data])  => {
          
          const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

          return inquirer.prompt([
            {
              type: "list",
              name: "manager",
              message: "Who is the employee's manager?",
              choices: managers
            }

          ]).then(managerChoice => {
            const manager = managerChoice.manager;
            params.push(manager);

            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
            return connection.promise().query(sql, params).then( result  => {
              
              console.log("Employee has been added!")
              return showEmployees();
            });
          });
        });
      });
    });
  });
};

// UPDATE AN EMPLOYEE ROLE
const updateEmployee = () => {
  const employeeSql = `SELECT * FROM employee`;
  return  connection.promise().query(employeeSql).then( ([data])  => {
    
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    return inquirer.prompt([
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
      return connection.promise().query(roleSql).then( ([data]) => {
        
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));

        return inquirer.prompt([
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
          return connection.promise().query(sql, params).then( result  => {
            
            console.log("Employee has been updated!");
            return showEmployees();
          });
        });
      });
    });
  });
};

// UPDATE EMPLOYEE MANAGERS
const updateManager = () => {
  const employeeSql = `SELECT * FROM employee`;
  return connection.promise().query(employeeSql).then(([data]) => {

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    return inquirer.prompt([
      {
        type: "list",
        name: "name",
        message: "Which Employee would you like to update?",
        choices: employees
      }
    ]).then(empChoice => {
      const employee = empChoice.name;
      const params = [];
      params.push(employee);
      const managerSql = `SELECT * FROM employee`;
      return connection.promise().query(managerSql).then(([data]) => {

        const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
        return inquirer.prompt([
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
          const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;
          return connection.promise().query(sql, params).then ( result => {
            
            console.log("Employee has been updated");
            return showEmployees();

          });
        });
      });
    });
  });
};
// VIEW EMPLOYEE BY MANAGER
const employeeManager = () => {
  console.log('Showing employees by manager...\n')
  const sql = `SELECT emp1.first_name, emp1.last_name,
                      concat(emp2.first_name," ",emp2.last_name) AS manager
               FROM employee emp1
               LEFT JOIN employee emp2 ON emp1.manager_id = emp2.id`;
    return connection.promise().query(sql)
    .then(([rows]) => {
     console.table(rows);
    })
     .catch(error => {
      throw error;
    });
};


// VIEW EMPLOYEE BY DEPARTMENT
const employeeDepartment = () => {
  console.log('Showing employees by departments...\n')
  const sql = `SELECT employee.first_name, employee.last_name,
                      department.name AS department
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id`;
    return connection.promise().query(sql)
     .then(([rows]) => {
      console.table(rows);
    })
      .catch(error => {
       throw error;
    });
};

// DELETE DEPARTMENT
const deleteDepartment = () => {
  const deptSql = `SELECT * FROM department`;
  return connection.promise().query(deptSql)
    .then(([data]) => {

      const dept = data.map(({ name, id }) => ({ name: name, value: id }));

      return inquirer.prompt([
        {
          type: "list",
          name: "dept",
          message: "What Department do you want to delete?",
          choices: dept
        }
      ]).then(deptChoice => {
        const dept = deptChoice.dept;
        const sql = `DELETE FROM department WHERE id = ?`;
        return connection.promise().query(sql, dept).then((result) => {
          return showDepartments();
        });
      });
    });
};

// DELETE ROLE
const deleteRole = () => {

  const roleSql = `SELECT * FROM role`;
  return connection.promise().query(roleSql)
    .then(([data]) => {

      const role = data.map(({ title, id }) => ({ name: title, value: id }));

      return inquirer.prompt([
        {
          type: "list",
          name: "role",
          message: "What Role do you want to delete?",
          choices: role
        }
      ]).then(roleChoice => {
        const role = roleChoice.role;
        const sql = `DELETE FROM role WHERE id = ?`;
        return connection.promise().query(sql, role);
      }).then(showRoles);
    });
};

// DELETE EMPLOYEES
function deleteEmployee() {
  const employeeSql = `SELECT * FROM employee`;
  return connection.promise()

    .query(employeeSql)
    .then(([data]) => {

      const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

      return inquirer.prompt([
        {
          type: "list",
          name: "name",
          message: "Which Employee do you want to delete?",
          choices: employees
        }
      ]).then(empChoice => {
        const employee = empChoice.name;
        const sql = `DELETE FROM employee WHERE id = ?`;
        return connection.promise().query(sql, employee)
          .then(() => {
            return showEmployees()
          }).catch((err) => {
            throw err

          });
      });
    });
};

// DEPARTMENT BUDGET
const viewBudget = () => {
  console.log('Showing budget by departments...\n')
  const sql = `SELECT department_id AS id,
                      department.name AS department,
                      SUM(salary) AS budget
               FROM role
                      JOIN department ON role.department_id = department.id GROUP BY department_id`;
    return connection.promise().query(sql)
    .then(([rows]) => {
      console.table(rows);
    })
    .catch(error => {
      throw error;
    })
};