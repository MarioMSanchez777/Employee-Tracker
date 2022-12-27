INSERT INTO department (name)
VALUES ("IT"),
       ("Engineering");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Manager", 100000, 1),
       ("Salesperson", 80000, 1);
       
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Craig", "Robbinson", 1, NULL),
       ("Joe", "Mama", 2, 1);
       