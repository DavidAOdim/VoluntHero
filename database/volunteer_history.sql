-- ============================================
-- Volunteer History Table
-- ============================================

DROP TABLE IF EXISTS volunteer_history;

CREATE TABLE volunteer_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteerId INT NOT NULL,
  volunteerName VARCHAR(100) NOT NULL,
  eventId INT NOT NULL,
  eventName VARCHAR(100) NOT NULL,
  eventDate DATE NOT NULL,
  eventLocation VARCHAR(255) NOT NULL,
  participationStatus ENUM('registered','in-progress','completed','cancelled') DEFAULT 'registered',
  hoursVolunteered INT DEFAULT 0,
  skillsUsed JSON DEFAULT NULL,
  feedback TEXT,
  rating INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Optional sample data
INSERT INTO volunteer_history 
(volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation, participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
VALUES
(1, 'John Doe', 1, 'Community Cleanup', '2025-11-15', 'New York, NY', 'completed', 5, '["teamwork","organization"]', 'Did great!', 5),
(2, 'Jane Smith', 2, 'Food Drive', '2025-11-20', 'Jersey City, NJ', 'registered', 0, '["cooking"]', '', 0);
