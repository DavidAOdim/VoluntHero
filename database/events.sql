-- ============================================
-- Events Table
-- ============================================

DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  requiredSkills JSON DEFAULT '[]',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Sample data
INSERT INTO events (name, date, location, requiredSkills) VALUES
('Community Cleanup', '2025-11-15', 'New York, NY', '["teamwork","organization"]'),
('Food Drive', '2025-11-20', 'Jersey City, NJ', '["cooking","serving"]'),
('Senior Care Visit', '2025-11-25', 'Brooklyn, NY', '["compassion","communication"]');
