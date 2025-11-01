-- ============================================
-- Volunteer History Table
-- Author: Vitor Hugo Santos
-- ============================================

CREATE TABLE IF NOT EXISTS volunteer_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteerId INT NOT NULL,
  volunteerName VARCHAR(100) NOT NULL,
  eventId INT NOT NULL,
  eventName VARCHAR(100) NOT NULL,
  eventDate DATE NOT NULL,
  eventLocation VARCHAR(255) NOT NULL,
  participationStatus ENUM('registered', 'in-progress', 'completed', 'cancelled') DEFAULT 'registered',
  hoursVolunteered INT DEFAULT 0,
  skillsUsed JSON DEFAULT NULL,
  feedback TEXT,
  rating INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional demo data
INSERT INTO volunteer_history 
(volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation, participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
VALUES
(1, 'John Doe', 1, 'Community Cleanup', '2024-01-10', 'Central Park, NY', 'completed', 4, '["teamwork","organization"]', 'Excellent participation', 5),
(2, 'Jane Smith', 2, 'Food Drive', '2024-01-05', 'Brooklyn Shelter, NY', 'completed', 6, '["cooking","serving"]', 'Very helpful volunteer', 4);
