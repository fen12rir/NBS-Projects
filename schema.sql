-- MariaDB Schema for National Book Store (NBS) POS Training Platform
-- Target Database: nbs_pos_training

CREATE DATABASE IF NOT EXISTS nbs_pos_training CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nbs_pos_training;

-- 1. Trainees & Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NULL,
  employee_id VARCHAR(64) NULL,
  role VARCHAR(32) DEFAULT 'trainee',
  branch_code VARCHAR(32) DEFAULT 'BR-014',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Trainee Learning Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id VARCHAR(64) PRIMARY KEY,
  completed_lessons LONGTEXT NOT NULL,
  completed_modules LONGTEXT NOT NULL,
  last_active_lesson_id VARCHAR(64) NULL,
  last_active_module_id VARCHAR(64) NULL,
  certification_completed_at DATETIME NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Scenario & Assessment Attempt Records
CREATE TABLE IF NOT EXISTS scenario_attempts (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  scenario_id VARCHAR(64) NOT NULL,
  scenario_title VARCHAR(255) NOT NULL,
  score INT NOT NULL,
  passed TINYINT(1) NOT NULL DEFAULT 0,
  steps_completed INT NOT NULL,
  total_steps INT NOT NULL,
  hints_used INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  mistakes LONGTEXT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_attempts (user_id),
  INDEX idx_scenario (scenario_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default demo user for instant offline and simulator access
INSERT IGNORE INTO users (id, name, email, employee_id, role, branch_code)
VALUES ('demo-cashier-001', 'Juan Dela Cruz (Trainee)', 'juan.delacruz@nbs.ph', 'NBS-EMP-2026-0891', 'trainee', 'BR-014');
