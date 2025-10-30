const db = require('../../../../db');
//const db = require('../../../db');

class VolunteerHistoryService {
    
    // Validation helper methods
    validateVolunteerId(volunteerId) {
        if (!volunteerId || isNaN(parseInt(volunteerId))) {
            throw new Error('Valid volunteer ID is required');
        }
        return parseInt(volunteerId);
    }

    validateEventId(eventId) {
        if (!eventId || isNaN(parseInt(eventId))) {
            throw new Error('Valid event ID is required');
        }
        return parseInt(eventId);
    }

    validateParticipationStatus(status) {
        const validStatuses = ['registered', 'attended', 'completed', 'cancelled', 'no_show'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid participation status. Must be one of: ${validStatuses.join(', ')}`);
        }
        return status;
    }

    validateHours(hours) {
        if (hours === undefined || hours === null) return 0;
        const hoursNum = parseFloat(hours);
        if (isNaN(hoursNum) || hoursNum < 0 || hoursNum > 24) {
            throw new Error('Hours volunteered must be between 0 and 24');
        }
        return hoursNum;
    }

    // Check if user exists in UserCredentials
    async validateVolunteerExists(volunteerId) {
        try {
            const [user] = await db.promise().query(`
                SELECT id, name 
                FROM UserCredentials 
                WHERE id = ?
            `, [volunteerId]);
            
            if (user.length === 0) {
                throw new Error('Volunteer not found');
            }
            return user[0];
        } catch (error) {
            throw new Error(`Error validating volunteer: ${error.message}`);
        }
    }

    // Check if event exists in events table
    async validateEventExists(eventId) {
        try {
            const [event] = await db.promise().query(`
                SELECT id, title FROM events WHERE id = ?
            `, [eventId]);
            
            if (event.length === 0) {
                throw new Error('Event not found');
            }
            return event[0];
        } catch (error) {
            throw new Error(`Error validating event: ${error.message}`);
        }
    }

    // Core service methods - UPDATED FOR YOUR SCHEMA
    async getVolunteerHistory(volunteerId) {
        const validVolunteerId = this.validateVolunteerId(volunteerId);
        
        try {
            const query = `
                SELECT
                    vh.history_id as id,
                    vh.user_id as volunteerId,
                    uc.name as volunteerName,
                    vh.event_id as eventId,
                    e.title as eventName,
                    e.date as eventDate,
                    e.location as eventLocation,
                    e.description as eventDescription,
                    vh.participation_status as participationStatus, 
                    vh.hours_volunteered as hoursVolunteered,       
                    vh.participation_date as participationDate,
                    vh.feedback,
                    e.skills as requiredSkills
                FROM VolunteerHistory vh
                LEFT JOIN UserCredentials uc ON vh.user_id = uc.id
                LEFT JOIN events e ON vh.event_id = e.id
                WHERE vh.user_id = ?
                ORDER BY e.date DESC
            `;
            const [rows] = await db.promise().query(query, [validVolunteerId]);

            // Transform the data
            return rows.map(record => ({
                id: record.id,
                volunteerId: record.volunteerId,
                volunteerName: record.volunteerName || `Volunteer ${record.volunteerId}`,
                eventId: record.eventId,
                eventName: record.eventName || `Event ${record.eventId}`,
                eventDate: record.eventDate,
                eventLocation: record.eventLocation,
                eventDescription: record.eventDescription,
                participationStatus: record.participationStatus,    
                hoursVolunteered: record.hoursVolunteered,
                participationDate: record.participationDate,
                feedback: record.feedback,
                requiredSkills: record.requiredSkills ? record.requiredSkills.split(',') : []
            }));
        } catch (error) {
            throw new Error(`Database error fetching history: ${error.message}`);
        }
    }

    async getVolunteerStats(volunteerId) {
        const validVolunteerId = this.validateVolunteerId(volunteerId);
        
        try {
            const history = await this.getVolunteerHistory(validVolunteerId);

            // Calculate statistics
            const totalHours = history.reduce((sum, record) => sum + (record.hoursVolunteered || 0), 0);
            const completedEvents = history.filter(record =>        
                record.participationStatus === "completed" || record.participationStatus === "attended"
            ).length;

            return {
                volunteerId: validVolunteerId,
                totalEvents: history.length,
                completedEvents: completedEvents,
                totalHours: parseFloat(totalHours.toFixed(2)),
                averageHours: history.length > 0 ? parseFloat((totalHours / history.length).toFixed(1)) : 0,
                participationRate: history.length > 0 ? parseFloat(((completedEvents / history.length) * 100).toFixed(1)) : 0
            };
        } catch (error) {
            throw new Error(`Database error calculating stats: ${error.message}`);
        }
    }

    async registerForEvent(volunteerId, eventId) {
        const validVolunteerId = this.validateVolunteerId(volunteerId);
        const validEventId = this.validateEventId(eventId);

        try {
            // Verify both volunteer and event exist
            await this.validateVolunteerExists(validVolunteerId);
            await this.validateEventExists(validEventId);

            // Check if already registered
            const [existing] = await db.promise().query(
                'SELECT history_id FROM VolunteerHistory WHERE user_id = ? AND event_id = ?',
                [validVolunteerId, validEventId]
            );

            if (existing.length > 0) {
                throw new Error('Volunteer already registered for this event');
            }

            const query = `
                INSERT INTO VolunteerHistory 
                (user_id, event_id, participation_status, participation_date)
                VALUES (?, ?, 'registered', NOW())
            `;
            const [result] = await db.promise().query(query, [validVolunteerId, validEventId]);

            return {
                id: result.insertId,
                volunteerId: validVolunteerId,
                eventId: validEventId,
                participationStatus: 'registered',
                message: 'Successfully registered for event'
            };
        } catch (error) {
            throw new Error(`Error registering for event: ${error.message}`);
        }
    }

    async updateParticipation(historyId, updates) {
        if (!historyId || isNaN(parseInt(historyId))) {
            throw new Error('Valid history ID is required');
        }

        const validHistoryId = parseInt(historyId);
        const allowedFields = ['participation_status', 'hours_volunteered', 'feedback'];
        const updateFields = [];
        const updateValues = [];

        // Build dynamic update query
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                if (key === 'participation_status') {
                    updates[key] = this.validateParticipationStatus(updates[key]);
                }
                if (key === 'hours_volunteered') {
                    updates[key] = this.validateHours(updates[key]);
                }
                updateFields.push(`${key} = ?`);
                updateValues.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        updateValues.push(validHistoryId);

        try {
            const query = `
                UPDATE VolunteerHistory 
                SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE history_id = ?
            `;
            const [result] = await db.promise().query(query, updateValues);

            if (result.affectedRows === 0) {
                throw new Error('History record not found');
            }

            // Return updated record
            const [updatedRecord] = await db.promise().query(`
                SELECT vh.*, uc.name as volunteerName, e.title as eventName
                FROM VolunteerHistory vh
                LEFT JOIN UserCredentials uc ON vh.user_id = uc.id
                LEFT JOIN events e ON vh.event_id = e.id
                WHERE vh.history_id = ?
            `, [validHistoryId]);

            return updatedRecord[0];
        } catch (error) {
            throw new Error(`Database error updating participation: ${error.message}`);
        }
    }

    async getEventVolunteers(eventId) {
        const validEventId = this.validateEventId(eventId);
        
        try {
            await this.validateEventExists(validEventId);

            const query = `
                SELECT
                    vh.history_id as id,
                    vh.user_id as volunteerId,
                    uc.name as volunteerName,
                    vh.participation_status as participationStatus,
                    vh.hours_volunteered as hoursVolunteered,
                    vh.participation_date as participationDate,
                    vh.feedback
                FROM VolunteerHistory vh
                LEFT JOIN UserCredentials uc ON vh.user_id = uc.id
                WHERE vh.event_id = ?
                ORDER BY vh.participation_date DESC
            `;
            const [rows] = await db.promise().query(query, [validEventId]);

            return rows.map(record => ({
                id: record.id,
                volunteerId: record.volunteerId,
                volunteerName: record.volunteerName || `Volunteer ${record.volunteerId}`,
                participationStatus: record.participationStatus,
                hoursVolunteered: record.hoursVolunteered,
                participationDate: record.participationDate,
                feedback: record.feedback
            }));
        } catch (error) {
            throw new Error(`Database error fetching event volunteers: ${error.message}`);
        }
    }

    async getAllHistory(page = 1, limit = 10) {
        const validPage = Math.max(1, parseInt(page));
        const validLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const offset = (validPage - 1) * validLimit;

        try {
            const query = `
                SELECT
                    vh.history_id as id,
                    vh.user_id as volunteerId,
                    uc.name as volunteerName,
                    vh.event_id as eventId,
                    e.title as eventName,
                    e.date as eventDate,
                    e.location as eventLocation,
                    vh.participation_status as participationStatus, 
                    vh.hours_volunteered as hoursVolunteered,
                    vh.participation_date as participationDate
                FROM VolunteerHistory vh
                LEFT JOIN UserCredentials uc ON vh.user_id = uc.id
                LEFT JOIN events e ON vh.event_id = e.id
                ORDER BY vh.participation_date DESC
                LIMIT ? OFFSET ?
            `;
            const [rows] = await db.promise().query(query, [validLimit, offset]);

            // Get total count for pagination
            const [countResult] = await db.promise().query(
                'SELECT COUNT(*) as total FROM VolunteerHistory'
            );
            const total = countResult[0].total;

            return {
                data: rows,
                pagination: {
                    page: validPage,
                    limit: validLimit,
                    total: total,
                    totalPages: Math.ceil(total / validLimit)
                }
            };
        } catch (error) {
            throw new Error(`Database error fetching all history: ${error.message}`);
        }
    }

    async getRecentVolunteerActivity(limit = 10) {
        const validLimit = Math.min(Math.max(1, parseInt(limit)), 50);
        
        try {
            const query = `
                SELECT
                    vh.history_id as id,
                    vh.user_id as volunteerId,
                    uc.name as volunteerName,
                    vh.event_id as eventId,
                    e.title as eventName,
                    vh.participation_status as participationStatus,
                    vh.participation_date as participationDate
                FROM VolunteerHistory vh
                LEFT JOIN UserCredentials uc ON vh.user_id = uc.id
                LEFT JOIN events e ON vh.event_id = e.id
                ORDER BY vh.participation_date DESC
                LIMIT ?
            `;
            const [rows] = await db.promise().query(query, [validLimit]);
            
            return rows;
        } catch (error) {
            throw new Error(`Database error fetching recent activity: ${error.message}`);
        }
    }

    // Admin function: Get overall platform statistics
    async getPlatformStats() {
        try {
            const [totalVolunteers] = await db.promise().query(
                'SELECT COUNT(*) as count FROM UserCredentials'
            );
            
            const [totalEvents] = await db.promise().query(
                'SELECT COUNT(*) as count FROM events'
            );
            
            const [totalHours] = await db.promise().query(
                'SELECT SUM(hours_volunteered) as total FROM VolunteerHistory WHERE hours_volunteered > 0'
            );
            
            const [recentRegistrations] = await db.promise().query(
                'SELECT COUNT(*) as count FROM VolunteerHistory WHERE participation_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
            );

            return {
                totalVolunteers: totalVolunteers[0].count,
                totalEvents: totalEvents[0].count,
                totalHoursVolunteered: totalHours[0].total || 0,
                recentRegistrations: recentRegistrations[0].count
            };
        } catch (error) {
            throw new Error(`Database error fetching platform stats: ${error.message}`);
        }
    }
}

module.exports = new VolunteerHistoryService();