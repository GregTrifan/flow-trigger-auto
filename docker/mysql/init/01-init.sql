-- Initialize FLA database
CREATE DATABASE IF NOT EXISTS fla_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fla_db;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON fla_db.* TO 'fla_user'@'%';
FLUSH PRIVILEGES;
