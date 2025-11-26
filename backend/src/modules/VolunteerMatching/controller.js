// backend/src/modules/VolunteerMatching/controller.js
const service = require("./service");

// GET matches for event
exports.getMatches = async (req, res) => {
  try {
    const { eventId } = req.params;
    const matches = await service.findMatches(eventId);

    res.json({ success: true, matches });
  } catch (err) {
    console.error("❌ Error getMatches:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ASSIGN volunteer
exports.assign = async (req, res) => {
  try {
    const { volunteerEmail, volunteerName, eventId } = req.body;

    if (!volunteerEmail || !volunteerName || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Missing volunteerEmail / volunteerName / eventId",
      });
    }

    console.log("📩 Assign request:", { volunteerEmail, volunteerName, eventId });

    const id = await service.assignVolunteer(volunteerEmail, volunteerName, eventId);

    res.json({
      success: true,
      message: "Volunteer assigned successfully",
      id,
    });
  } catch (err) {
    console.error("❌ Error assign:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET already assigned
exports.getAssigned = async (req, res) => {
  try {
    const { eventId } = req.params;
    const assigned = await service.getAssigned(eventId);

    res.json({ success: true, assigned });
  } catch (err) {
    console.error("❌ Error getAssigned:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


