const volunteerHistoryService = require('./service');

const getVolunteerHistory = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const history = await volunteerHistoryService.getVolunteerHistory(volunteerId);
        
        res.json({
            success: true,
            message: "Volunteer history retrieved successfully",
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const addHistoryRecord = async (req, res) => {
    try {
        const { volunteerId, eventId, participationStatus, hours, feedback } = req.body;
        const record = await volunteerHistoryService.addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback);
        
        res.json({
            success: true,
            message: "History record added successfully",
            data: record
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getVolunteerStats = async (req, res) => {
    try {
        const { volunteerId } = req.params;
        const stats = await volunteerHistoryService.getVolunteerStats(volunteerId);
        
        res.json({
            success: true,
            message: "Volunteer statistics retrieved successfully",
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getVolunteerHistory, addHistoryRecord, getVolunteerStats };