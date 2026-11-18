-- MariaDB Schema for National Book Store (NBS) POS Training Platform
-- Target Database: nbs_pos_training
-- Version: 2.0.0 (Enterprise Auth & Multi-Branch Admin Portal)

CREATE DATABASE IF NOT EXISTS nbs_pos_training CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nbs_pos_training;

-- 1. Branches Reference Table
CREATE TABLE IF NOT EXISTS branches (
  code VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  seat_limit INT NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the 11 verified NBS branches
INSERT INTO branches (code, name, region, is_active) VALUES
  ('2438', 'NBS SM North Edsa', 'NCR - North', 1),
  ('2445', 'NBS Robinsons Ortigas', 'NCR - East', 1),
  ('2447', 'NBS Shangrila', 'NCR - Central', 1),
  ('2448', 'NBS SM Megamall', 'NCR - Central', 1),
  ('2211', 'NBS SM Clark', 'Region III - Central Luzon', 1),
  ('2213', 'NBS SM Pampanga', 'Region III - Central Luzon', 1),
  ('2206', 'NBS SM Baguio', 'CAR - Cordillera', 1),
  ('2201', 'NBS Abanao Baguio', 'CAR - Cordillera', 1),
  ('2208', 'NBS SM Hypermarket Laoag', 'Region I - Ilocos', 1),
  ('2360', 'NBS Robinsons Ilocos Norte', 'Region I - Ilocos', 1),
  ('2204', 'NBS Vigan', 'Region I - Ilocos', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name), region = VALUES(region), is_active = VALUES(is_active);

-- 2. Users Table (Trainees, Branch Admins, Super Admins)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact_no VARCHAR(32) NOT NULL,
  branch_code VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('trainee', 'branch_admin', 'super_admin') NOT NULL DEFAULT 'trainee',
  status ENUM('pending', 'active', 'rejected', 'deactivated') NOT NULL DEFAULT 'pending',
  rejection_reason VARCHAR(255) NULL,
  employee_id VARCHAR(64) NULL,
  access_expires_at DATETIME NULL,
  suspended_from DATETIME NULL,
  suspended_until DATETIME NULL,
  disabled_reason VARCHAR(255) NULL,
  exam_attempt_limit INT NULL DEFAULT NULL,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_branch (branch_code),
  INDEX idx_users_status (status),
  INDEX idx_users_role (role),
  CONSTRAINT fk_users_branch FOREIGN KEY (branch_code) REFERENCES branches(code) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Authenticated Sessions Table (SHA-256 token hashing)
CREATE TABLE IF NOT EXISTS sessions (
  token_hash VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Trainee Learning Progress Summary Table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id VARCHAR(64) PRIMARY KEY,
  completed_lessons LONGTEXT NOT NULL,
  completed_modules LONGTEXT NOT NULL,
  last_active_lesson_id VARCHAR(64) NULL,
  last_active_module_id VARCHAR(64) NULL,
  certification_completed_at DATETIME NULL,
  certificate_id VARCHAR(64) NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Normalized Lesson Completions Table (Detailed Analytics)
CREATE TABLE IF NOT EXISTS lesson_completions (
  user_id VARCHAR(64) NOT NULL,
  lesson_id VARCHAR(64) NOT NULL,
  module_id VARCHAR(64) NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  INDEX idx_lc_module (module_id),
  INDEX idx_lc_completed_at (completed_at),
  CONSTRAINT fk_lc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Scenario & Assessment Attempt Records
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
  case_results LONGTEXT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sa_user (user_id),
  INDEX idx_sa_scenario (scenario_id),
  INDEX idx_sa_timestamp (timestamp),
  CONSTRAINT fk_sa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Global Application Settings
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key VARCHAR(64) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default global settings
INSERT INTO app_settings (setting_key, setting_value) VALUES
  ('default_access_days', '30'),
  ('single_session_enabled', 'false'),
  ('default_exam_attempts', '3'),
  ('auto_disable_inactivity_days', '60')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- 8. Admin Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id VARCHAR(64) NULL,
  action VARCHAR(64) NOT NULL,
  target_user_id VARCHAR(64) NULL,
  details LONGTEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_id),
  INDEX idx_audit_target (target_user_id),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
