const volunteerMatchingService = require('./service');

const findMatches = async (req, res) => {
    try {
        const { eventId } = req.params;
        const matches = await volunteerMatchingService.findVolunteerMatches(eventId);
        
        res.json({
            success: true,
            message: "Volunteer matches retrieved successfully",
            data: matches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createMatch = async (req, res) => {
    try {
        const { volunteerId, eventId } = req.body;
        const match = await volunteerMatchingService.createVolunteerMatch(volunteerId, eventId);
        
        res.json({
            success: true,
            message: "Volunteer successfully matched to event",
            data: match
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { findMatches, createMatch };