-- bootstrap
CREATE DATABASE IF NOT EXISTS qnaj CHARACTER SET utf8;
USE qnaj;

-- 質問者
CREATE TABLE IF NOT EXISTS qnaj.q_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  password VARCHAR(255) NOT NULL,
  q_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  PRIMARY KEY(id),
  INDEX (q_hash, name)
);

-- 回答者
CREATE TABLE IF NOT EXISTS qnaj.a_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255),
  q_user_id INT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  PRIMARY KEY(id)
);

-- 質問
CREATE TABLE IF NOT EXISTS qnaj.questions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  q_user_id INT UNSIGNED NOT NULL,
  content TEXT DEFAULT NULL,
  public TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  PRIMARY KEY (id),
  FOREIGN KEY (q_user_id) REFERENCES q_users (id) ON DELETE CASCADE,
  INDEX (q_user_id)
);

-- 回答
CREATE TABLE IF NOT EXISTS qnaj.answers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  a_user_id INT UNSIGNED NOT NULL,
  q_id INT UNSIGNED NOT NULL,
  content TEXT DEFAULT NULL,
  public TINYINT(1) NOT NULL DEFAULT 0,
  public_type INT NOT NULL DEFAULT 0, -- 1 正解, 2 不正解
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  deleted_at DATETIME,
  PRIMARY KEY (id),
  FOREIGN KEY (a_user_id) REFERENCES a_users (id) ON DELETE CASCADE,
  INDEX (a_user_id)
);
