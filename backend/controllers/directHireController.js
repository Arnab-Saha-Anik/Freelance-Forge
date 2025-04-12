const express = require("express");
const DirectHire = require("../models/directHireModel");
const Project = require("../models/projectModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Direct Hire Route
router.post("/", verifyToken, async (req, res) => {
  const { freelancerId, projectId } = req.body;

  if (!freelancerId || !projectId) {
    return res.status(400).json({ error: "Freelancer ID and Project ID are required." });
  }

  try {
    // Find the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Ensure the client is authorized
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to hire for this project." });
    }

    // Create a DirectHire record
    const directHire = new DirectHire({
      freelancerId,
      clientId: req.user.id,
      projectId,
    });

    await directHire.save();

    // Notify the freelancer
    await Notification.create({
      user: freelancerId,
      projectId: projectId,
      message: `You have been offered to be hired for the project "${project.title}".`,
    });

    res.status(200).json({ message: "Freelancer has been offered to hire successfully.", directHire });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "This direct hire already exists." });
    }
    console.error("Error in /direct-hire:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Direct Hires for a Client
router.get("/client", verifyToken, async (req, res) => {
  try {
    const directHires = await DirectHire.find({ clientId: req.user.id })
      .populate("freelancerId", "name email")
      .populate("projectId", "title description");

    res.status(200).json(directHires);
  } catch (error) {
    console.error("Error fetching direct hires for client:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Direct Hires for a Freelancer (Pending Only)
router.get("/freelancer", verifyToken, async (req, res) => {
  try {
    const directHires = await DirectHire.find({ freelancerId: req.user.id, status: "pending" }) // Filter by pending status
      .populate("clientId", "name email")
      .populate("projectId", "title description budget deadline");

    res.status(200).json(directHires);
  } catch (error) {
    console.error("Error fetching direct hires for freelancer:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Direct Hire Details by Project ID
router.get("/details/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const directHire = await DirectHire.findOne({ projectId, freelancerId: req.user.id })
      .populate("clientId", "name email")
      .populate("projectId", "title description budget deadline");

    if (!directHire) {
      return res.status(404).json({ error: "Direct hire record not found." });
    }

    res.status(200).json({
      project: directHire.projectId,
      client: directHire.clientId,
    });
  } catch (error) {
    console.error("Error fetching direct hire details:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Accept Direct Hire
router.put("/accept/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const directHire = await DirectHire.findById(id).populate("projectId").populate("clientId");

    if (!directHire) {
      return res.status(404).json({ error: "Direct hire record not found." });
    }

    if (directHire.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to accept this project." });
    }

    // Check if the project has already been accepted
    const existingAcceptedHire = await DirectHire.findOne({
      projectId: directHire.projectId._id,
      status: "accepted",
    });

    if (existingAcceptedHire) {
      return res.status(400).json({
        error: "This project has already been accepted by another freelancer.",
      });
    }

    // Mark the direct hire as accepted
    directHire.status = "accepted";
    await directHire.save();

    // Notify the client
    await Notification.create({
      user: directHire.clientId._id,
      message: `Freelancer (${req.user.email}) has accepted your project "${directHire.projectId.title}".`,
    });

    res.status(200).json({ message: "Project accepted successfully." });
  } catch (error) {
    console.error("Error accepting direct hire:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reject Direct Hire
router.delete("/reject/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Find the direct hire record
    const directHire = await DirectHire.findById(id).populate("projectId").populate("clientId");

    if (!directHire) {
      return res.status(404).json({ error: "Direct hire record not found." });
    }

    // Ensure the freelancer is authorized to reject the offer
    if (directHire.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to reject this project." });
    }

    // Fetch the freelancer's email
    const freelancer = await User.findById(req.user.id).select("email");
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer not found." });
    }

    // Notify the client about the rejection
    await Notification.create({
      user: directHire.clientId._id, // Reference the client
      message: `Freelancer (${freelancer.email}) has rejected your hire offer for the project "${directHire.projectId.title}".`,
    });

    // Delete the direct hire record
    await DirectHire.findByIdAndDelete(id);

    res.status(200).json({ message: "Project rejected successfully." });
  } catch (error) {
    console.error("Error rejecting direct hire:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;