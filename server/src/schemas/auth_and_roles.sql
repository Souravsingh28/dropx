CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_number VARCHAR(100) NOT NULL UNIQUE, -- used as username
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','supervisor','incharge','worker') NOT NULL DEFAULT 'worker',
  name VARCHAR(150) NOT NULL,
  age INT,
  gender ENUM('male','female','other') DEFAULT NULL,
  photo_url VARCHAR(255),
  bank_account VARCHAR(50),
  ifsc VARCHAR(20),
  phone VARCHAR(20),
  date_of_joining DATE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed admin (id_number=ADMIN001, password Admin@123). CHANGE ASAP.
INSERT INTO users (id_number, password_hash, role, name, age, gender, phone)
VALUES ('ADMIN001', '$2a$10$kYg8wo3g7i6b2h54R1o4U.9CqT2bqJ6Z9f0mN2wX4FEdYkGq0nGx6', 'admin', 'Administrator', 0, 'other', '')
ON DUPLICATE KEY UPDATE id_number=id_number;
