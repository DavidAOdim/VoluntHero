-- ============================================
-- Volunteers Table
-- ============================================

DROP TABLE IF EXISTS volunteers;

CREATE TABLE volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  location VARCHAR(255) NOT NULL,
  skills JSON,
  availability JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Sample data
INSERT INTO volunteers (name, email, location, skills, availability) VALUES
('John Doe', 'john@example.com', 'New York, NY', '["teaching","mentoring","first-aid"]', '["2025-11-10","2025-11-15"]'),
('Jane Smith', 'jane@example.com', 'Jersey City, NJ', '["cooking","organizing","driving"]', '["2025-11-12","2025-11-20"]'),
('Mike Johnson', 'mike@example.com', 'New York, NY', '["construction","heavy-lifting"]', '["2025-11-18","2025-11-25"]');
