-- ============================================
-- Volunteer Matches Table
-- Author: Vitor Hugo Santos
-- ============================================

CREATE TABLE IF NOT EXISTS volunteer_matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteerId INT NOT NULL,
  eventId INT NOT NULL,
  volunteerName VARCHAR(100) NOT NULL,
  eventName VARCHAR(100) NOT NULL,
  matchScore FLOAT DEFAULT 0,
  matchDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('matched', 'assigned', 'completed', 'cancelled') DEFAULT 'matched',
  FOREIGN KEY (volunteerId) REFERENCES volunteers(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
);
