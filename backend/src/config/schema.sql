-- VolunteerHistory Table - Integrated with your existing schema
CREATE TABLE IF NOT EXISTS VolunteerHistory (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    participation_status ENUM('registered', 'attended', 'completed', 'cancelled', 'no_show') DEFAULT 'registered',
    hours_volunteered DECIMAL(5,2) DEFAULT 0,
    participation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserCredentials(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES EventDetails(event_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_event (user_id, event_id)
);

-- Sample data that matches your existing users and events
INSERT IGNORE INTO VolunteerHistory (user_id, event_id, participation_status, hours_volunteered, feedback) VALUES
(1, 1, 'completed', 4.5, 'Great experience organizing food donations'),
(2, 1, 'completed', 3.0, 'Enjoyed helping the community'),
(3, 2, 'registered', 0, NULL),
(1, 3, 'attended', 2.5, 'Well organized event'),
(2, 3, 'completed', 5.0, 'Would volunteer again');