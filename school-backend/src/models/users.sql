CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  class VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  reg_no VARCHAR(50),
  class VARCHAR(50),
  guardian_name VARCHAR(255)
);

CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  position VARCHAR(255)
);
