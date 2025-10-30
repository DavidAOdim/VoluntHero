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
        const hoursNum = parseFloat(hours);
        if (hoursNum < 0 || hoursNum > 24) {
            throw new Error('Hours volunteered must be between 0 and 24');
        }
        return hoursNum;
    }

    // Core service methods
    async getVolunteerHistory(volunteerId) {
        const validVolunteerId = this.validateVolunteerId(volunteerId);
        
        try {
            const query = `
                SELECT
                    vh.history_id as id,
                    vh.user_id as volunteerId,
                    up.full_name as volunteerName,
                    vh.event_id as eventId,
                    ed.name as eventName,
                    ed.event_date as eventDate,
                    ed.location as eventLocation,
                    vh.participation_status as participationStatus, 
                    vh.hours_volunteered as hoursVolunteered,       
                    vh.participation_date as participationDate,
                    ed.required_skills as skillsUsed
                FROM VolunteerHistory vh
                JOIN EventDetails ed ON vh.event_id = ed.event_id   
                JOIN UserProfile up ON vh.user_id = up.user_id      
                WHERE vh.user_id = ?
                ORDER BY ed.event_date DESC
            `;
            const [rows] = await db.promise().query(query, [validVolunteerId]);

            if (rows.length === 0) {
                return [];
            }

            // Transform the data to match frontend expectations
            return rows.map(record => ({
                id: record.id,
                volunteerId: record.volunteerId,
                volunteerName: record.volunteerName,
                eventId: record.eventId,
                eventName: record.eventName,
                eventDate: record.eventDate,
                eventLocation: record.eventLocation,
                participationStatus: record.participationStatus,    
                hoursVolunteered: record.hoursVolunteered,
                participationDate: record.participationDate,
                skillsUsed: record.skillsUsed ? JSON.parse(record.skillsUsed) : []
            }));
        } catch (error) {
            throw new Error(`Database error fetching history: ${error.message}`);
        }
    }

    async getVolunteerStats(volunteerId) {
        const validVolunteerId = this.validateVolunteerId(volunteerId);
        
        try {
            const history = await this.getVolunteerHistory(validVolunteerId);

            // Calculate statistics from database records
            const totalHours = history.reduce((sum, record) => sum + (record.hoursVolunteered || 0), 0);
            const completedEvents = history.filter(record =>        
                record.participationStatus === "completed"
            ).length;

            const allSkills = history.flatMap(record => record.skillsUsed || []);
            const uniqueSkills = [...new Set(allSkills)];

            return {
                volunteerId: validVolunteerId,
                totalEvents: history.length,
                completedEvents: completedEvents,
                totalHours: parseFloat(totalHours.toFixed(2)),
                skillsUsed: uniqueSkills,
                averageHours: history.length > 0 ? parseFloat((totalHours / history.length).toFixed(1)) : 0,
                participationRate: history.length > 0 ? parseFloat(((completedEvents / history.length) * 100).toFixed(1)) : 0
            };
        } catch (error) {
            throw new Error(`Database error calculating stats: ${error.message}`);
        }
    }

    async addHistoryRecord(volunteerId, eventId, participationStatus, hours = 0, feedback = null) {
        const validVolunteerId = this.validateVolunteerId(volunteerId);
        const validEventId = this.validateEventId(eventId);
        const validStatus = this.validateParticipationStatus(participationStatus);
        const validHours = this.validateHours(hours);

        try {
            // Check if record already exists
            const [existing] = await db.promise().query(
                'SELECT history_id FROM VolunteerHistory WHERE user_id = ? AND event_id = ?',
                [validVolunteerId, validEventId]
            );

            if (existing.length > 0) {
                throw new Error('Volunteer already registered for this event');
            }

            const query = `
                INSERT INTO VolunteerHistory 
                (user_id, event_id, participation_status, hours_volunteered, participation_date, feedback)
                VALUES (?, ?, ?, ?, NOW(), ?)
            `;
            const [result] = await db.promise().query(query, [      
                validVolunteerId,
                validEventId,
                validStatus,
                validHours,
                feedback
            ]);

            // Return the complete new record
            const [newRecord] = await db.promise().query(`
                SELECT * FROM VolunteerHistory WHERE history_id = ?
            `, [result.insertId]);

            return {
                id: result.insertId,
                volunteerId: validVolunteerId,
                eventId: validEventId,
                participationStatus: validStatus,
                hoursVolunteered: validHours,
                participationDate: newRecord[0].participation_date,
                feedback: feedback
            };
        } catch (error) {
            throw new Error(`Database error adding history: ${error.message}`);
        }
    }

    async updateHistoryRecord(historyId, updates) {
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
            const [updatedRecord] = await db.promise().query(
                'SELECT * FROM VolunteerHistory WHERE history_id = ?',
                [validHistoryId]
            );

            return updatedRecord[0];
        } catch (error) {
            throw new Error(`Database error updating history: ${error.message}`);
        }
    }

    async getAllHistory(page = 1, limit = 10) {
        const validPage = Math.max(1, parseInt(page));
        const validLimit = Math.min(Math.max(1, parseInt(limit)), 100); // Max 100 records
        const offset = (validPage - 1) * validLimit;

        try {
            const query = `
                SELECT
                    vh.history_id as id,
                    vh.user_id as volunteerId,
                    up.full_name as volunteerName,
                    vh.event_id as eventId,
                    ed.name as eventName,
                    ed.event_date as eventDate,
                    vh.participation_status as participationStatus, 
                    vh.hours_volunteered as hoursVolunteered,
                    vh.participation_date as participationDate
                FROM VolunteerHistory vh
                JOIN EventDetails ed ON vh.event_id = ed.event_id   
                JOIN UserProfile up ON vh.user_id = up.user_id      
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

    async deleteHistoryRecord(historyId) {
        const validHistoryId = this.validateVolunteerId(historyId); // Reusing volunteer ID validation

        try {
            const [result] = await db.promise().query(
                'DELETE FROM VolunteerHistory WHERE history_id = ?',
                [validHistoryId]
            );

            if (result.affectedRows === 0) {
                throw new Error('History record not found');
            }

            return { message: 'History record deleted successfully' };
        } catch (error) {
            throw new Error(`Database error deleting history: ${error.message}`);
        }
    }
}

module.exports = new VolunteerHistoryService();