CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) DEFAULT 'noi',
    description TEXT,
    icon_name VARCHAR(100) DEFAULT 'Activity',
    doctor_count INT DEFAULT 0,
    average_rating NUMERIC(3, 1) DEFAULT 5.0,
    total_reviews INT DEFAULT 0,
    note VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'patient',
    avatar TEXT,
    department_id VARCHAR(100) REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100),
    user_name VARCHAR(255) NOT NULL,
    user_avatar TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    card_type VARCHAR(20),
    card_number VARCHAR(50),
    patient_dob VARCHAR(20),
    patient_gender VARCHAR(10),
    patient_address TEXT,
    has_card_verified BOOLEAN DEFAULT FALSE,
    department_id VARCHAR(100) REFERENCES departments(id) ON DELETE CASCADE,
    department_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255),
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    service_attitude INT DEFAULT 5,
    facilities INT DEFAULT 5,
    wait_time INT DEFAULT 5,
    cost_transparency INT DEFAULT 5,
    images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'approved',
    likes INT DEFAULT 0,
    visit_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_dept ON reviews(department_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(has_card_verified);
CREATE INDEX IF NOT EXISTS idx_departments_category ON departments(category);
