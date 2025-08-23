CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE, -- optional link to users.id
  emp_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  bank_account VARCHAR(50),
  ifsc VARCHAR(20),
  id_number VARCHAR(100), -- mirrors users.id_number for workers
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS employee_adjustments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  kind ENUM('incentive','deduction') NOT NULL,
  note VARCHAR(255),
  date DATE NOT NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
