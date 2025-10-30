const volunteerHistoryService = require('./service');

class VolunteerHistoryController {
    async getVolunteerHistory(req, res) {
        try {
            const { volunteerId } = req.params;
            
            if (!volunteerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Volunteer ID is required'
                });
            }

            const history = await volunteerHistoryService.getVolunteerHistory(volunteerId);
            
            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getVolunteerStats(req, res) {
        try {
            const { volunteerId } = req.params;
            
            if (!volunteerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Volunteer ID is required'
                });
            }

            const stats = await volunteerHistoryService.getVolunteerStats(volunteerId);
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async addHistoryRecord(req, res) {
        try {
            const { volunteerId, eventId, participationStatus, hours, feedback } = req.body;
            
            // Validate required fields
            if (!volunteerId || !eventId || !participationStatus) {
                return res.status(400).json({
                    success: false,
                    message: 'Volunteer ID, Event ID, and Participation Status are required'
                });
            }

            const newRecord = await volunteerHistoryService.addHistoryRecord(
                volunteerId, 
                eventId, 
                participationStatus, 
                hours, 
                feedback
            );
            
            res.status(201).json({
                success: true,
                message: 'History record added successfully',
                data: newRecord
            });
        } catch (error) {
            const statusCode = error.message.includes('already registered') ? 409 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateHistoryRecord(req, res) {
        try {
            const { historyId } = req.params;
            const updates = req.body;
            
            if (!historyId) {
                return res.status(400).json({
                    success: false,
                    message: 'History ID is required'
                });
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No update data provided'
                });
            }

            const updatedRecord = await volunteerHistoryService.updateHistoryRecord(historyId, updates);
            
            res.json({
                success: true,
                message: 'History record updated successfully',
                data: updatedRecord
            });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    async getAllHistory(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await volunteerHistoryService.getAllHistory(page, limit);
            
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteHistoryRecord(req, res) {
        try {
            const { historyId } = req.params;
            
            if (!historyId) {
                return res.status(400).json({
                    success: false,
                    message: 'History ID is required'
                });
            }

            const result = await volunteerHistoryService.deleteHistoryRecord(historyId);
            
            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 500;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    async getRecentActivity(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            
            const activity = await volunteerHistoryService.getRecentVolunteerActivity(limit);
            
            res.json({
                success: true,
                data: activity
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new VolunteerHistoryController();
// const volunteerHistoryService = require('./service');

// const getVolunteerHistory = async (req, res) => {
//     try {
//         const { volunteerId } = req.params;
//         const history = await volunteerHistoryService.getVolunteerHistory(volunteerId);
        
//         res.json({
//             success: true,
//             message: "Volunteer history retrieved successfully",
//             data: history
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// const addHistoryRecord = async (req, res) => {
//     try {
//         const { volunteerId, eventId, participationStatus, hours, feedback } = req.body;
//         const record = await volunteerHistoryService.addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback);
        
//         res.json({
//             success: true,
//             message: "History record added successfully",
//             data: record
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// const getVolunteerStats = async (req, res) => {
//     try {
//         const { volunteerId } = req.params;
//         const stats = await volunteerHistoryService.getVolunteerStats(volunteerId);
        
//         res.json({
//             success: true,
//             message: "Volunteer statistics retrieved successfully",
//             data: stats
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// module.exports = { getVolunteerHistory, addHistoryRecord, getVolunteerStats };