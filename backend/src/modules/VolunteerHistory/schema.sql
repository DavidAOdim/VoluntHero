-- ================================================
-- Volunteer History Table Schema
-- Author: Vitor Hugo Santos
-- ================================================

CREATE TABLE IF NOT EXISTS volunteer_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteerId INT NOT NULL,
  volunteerName VARCHAR(100) NOT NULL,
  eventId INT NOT NULL,
  eventName VARCHAR(150) NOT NULL,
  eventDate DATE NOT NULL,
  eventLocation VARCHAR(150) NOT NULL,
  participationStatus ENUM('registered', 'in-progress', 'completed', 'cancelled') DEFAULT 'registered',
  hoursVolunteered DECIMAL(5,2) DEFAULT 0,
  skillsUsed JSON DEFAULT (JSON_ARRAY()),
  feedback TEXT,
  rating INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
