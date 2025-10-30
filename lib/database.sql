-- Create database (run this in pgAdmin)
-- CREATE DATABASE user_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'guest' CHECK (role IN ('super_admin', 'admin', 'guest')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP table for authentication
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(15) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tehsils table
CREATE TABLE IF NOT EXISTS tehsils (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district_id INTEGER REFERENCES districts(id)
);

-- Mandals table
CREATE TABLE IF NOT EXISTS mandals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tehsil_id INTEGER REFERENCES tehsils(id)
);

-- Grh Sampar form data
CREATE TABLE IF NOT EXISTS grh_sampar_forms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    district_id INTEGER REFERENCES districts(id),
    tehsil_id INTEGER REFERENCES tehsils(id),
    mandal_id INTEGER REFERENCES mandals(id),
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    hobby TEXT,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default districts
INSERT INTO districts (name) VALUES 
('Nagaur'),
('Merta'),
('Didwana')
ON CONFLICT DO NOTHING;

-- Insert tehsils for Nagaur
INSERT INTO tehsils (name, district_id) VALUES 
('Nagaur', 1),
('Merta', 1),
('Didwana', 1),
('Parbatsar', 1),
('Makrana', 1)
ON CONFLICT DO NOTHING;

-- Insert tehsils for Merta
INSERT INTO tehsils (name, district_id) VALUES 
('Merta', 2),
('Degana', 2),
('Jayal', 2)
ON CONFLICT DO NOTHING;

-- Insert tehsils for Didwana
INSERT INTO tehsils (name, district_id) VALUES 
('Didwana', 3),
('Ladnun', 3),
('Nokha', 3)
ON CONFLICT DO NOTHING;

-- Insert mandals (example for Nagaur tehsil)
INSERT INTO mandals (name, tehsil_id) VALUES 
('Mandal 1', 1),
('Mandal 2', 1),
('Mandal 3', 1),
('Mandal 4', 1),
('Mandal 5', 1),
('Mandal 6', 1),
('Mandal 7', 1),
('Mandal 8', 1),
('Mandal 9', 1),
('Mandal 10', 1),
('Mandal 11', 1),
('Mandal 12', 1),
('Mandal 13', 1),
('Mandal 14', 1)
ON CONFLICT DO NOTHING;

-- Vitrit Savaymsevak table
CREATE TABLE IF NOT EXISTS vitrit_savaymsevak (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name_hindi VARCHAR(255) NOT NULL,
    location_hindi VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    age INTEGER NOT NULL,
    class_profession_hindi VARCHAR(255) NOT NULL,
    responsibility_hindi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create super admin user (password: 123456789)
INSERT INTO users (name, mobile, email, password, role, is_verified) VALUES 
('Super Admin', '9999999999', 'admin@example.com', '$2b$10$rQZ8K9LmN3pO4qR5sT6uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q', 'super_admin', true)
ON CONFLICT (mobile) DO NOTHING;
