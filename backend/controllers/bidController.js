const express = require("express");
const router = express.Router();
const Bid = require("../models/bidModel");
const Notification = require("../models/notificationModel"); // Import the Notification model
const { verifyToken } = require("../middleware/authMiddleware");
const Project = require("../models/projectModel");
const User = require("../models/userModel");
const Activity = require("../models/activityModel"); // Import the Activity model

// Route to fetch accepted bids
router.get("/accepted", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming `verifyToken` adds `user` to `req`
    const bids = await Bid.find({ freelancerId: userId, status: "accepted" }).populate("projectId", "title client");
    res.status(200).json(bids);
  } catch (error) {
    console.error("Error fetching accepted bids:", error);
    res.status(500).json({ error: "Failed to fetch accepted bids" });
  }
});

// Route to fetch selected bids for the freelancer
router.get("/selected", verifyToken, async (req, res) => {
  try {
    const freelancerId = req.user.id; // Assuming `verifyToken` adds `user` to `req`

    // Fetch bids with status "selected" for the freelancer
    const selectedBids = await Bid.find({ freelancerId, status: "selected" })
      .populate({
        path: "projectId",
        populate: {
          path: "client", // Populate the client field from the Project model
          select: "name email", // Select only the name and email fields
        },
        select: "title description budget deadline client", // Select relevant project fields
      });

    if (!selectedBids || selectedBids.length === 0) {
      return res.status(404).json({ error: "No selected bids found." });
    }

    // Format the response to include project and client details
    const formattedBids = selectedBids.map((bid) => ({
      bidId: bid._id,
      bidAmount: bid.amount,
      project: {
        title: bid.projectId?.title || "N/A",
        description: bid.projectId?.description || "N/A",
        budget: bid.projectId?.budget || 0,
        deadline: bid.projectId?.deadline || "N/A",
      },
      client: {
        name: bid.projectId?.client?.name || "N/A",
        email: bid.projectId?.client?.email || "N/A",
      },
    }));

    res.status(200).json(formattedBids);
  } catch (error) {
    console.error("Error fetching selected bids:", error);
    res.status(500).json({ error: "Failed to fetch selected bids." });
  }
});

// Route to fetch bids for a specific project
router.get("/:projectId", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId as a valid ObjectId
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const bids = await Bid.find({ projectId }).populate("freelancerId", "name email");
    res.status(200).json(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
});

// Route to fetch a freelancer's bid for a specific project
router.get("/:projectId/my-bid", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const freelancerId = req.user.id; // Assuming `verifyToken` adds `user` to `req`

    const bid = await Bid.findOne({ projectId, freelancerId });
    if (!bid) {
      return res.status(404).json({ error: "No bid found for this project." });
    }

    res.status(200).json(bid);
  } catch (error) {
    console.error("Error fetching bid:", error);
    res.status(500).json({ error: "Failed to fetch bid." });
  }
});

// Route to create a new bid
router.post("/:projectId/bid", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { bidAmount } = req.body;
    const freelancerId = req.user.id;

    const project = await Project.findById(projectId).populate("client", "email");
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the freelancer has already submitted a bid for this project
    const existingBid = await Bid.findOne({ projectId, freelancerId });
    if (existingBid) {
      return res.status(400).json({ error: "You have already submitted a bid for this project." });
    }

    // Create a new bid
    const newBid = await Bid.create({
      projectId,
      freelancerId,
      amount: bidAmount,
      status: "pending",
    });
    const freelancer = await User.findById(req.user.id).select("email");
    // Log the activity
    await Activity.create({
      userId: freelancerId,
      action: `You placed a bid of $${bidAmount} on project "${project.title}".`,
    });

    // Create a notification for the client
    await Notification.create({
      user: project.client._id, // Client ID
      message: `Freelancer (${freelancer.email}) has posted a bid for project "${project.title}".`,
    });

    res.status(201).json({ message: "Bid submitted successfully.", bid: newBid });
  } catch (error) {
    console.error("Error submitting bid:", error);
    res.status(500).json({ error: "Failed to submit bid" });
  }
});

// Route to select a bid
router.put("/select/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findByIdAndUpdate(
      bidId,
      { status: "selected" },
      { new: true }
    ).populate("freelancerId", "email").populate("projectId", "title client");

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Notify the freelancer
    await Notification.create({
      user: bid.freelancerId._id,
      message: `Your bid of $${bid.amount} for the project "${bid.projectId.title}" has been selected.`,
    });

    // Log the activity for the client
    await Activity.create({
      userId: bid.projectId.client,
      action: `You selected the bid of $${bid.amount} for the project "${bid.projectId.title}" to the freelancer (${bid.freelancerId.email}).`,
    });

    res.status(200).json({ message: "Bid selected successfully.", bid });
  } catch (error) {
    console.error("Error selecting bid:", error);
    res.status(500).json({ error: "Failed to select bid." });
  }
});

// Route to accept a selected bid
router.put("/accept/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;

    // Find the bid and update its status to "accepted"
    const bid = await Bid.findByIdAndUpdate(
      bidId,
      { status: "accepted" },
      { new: true }
    ).populate("projectId freelancerId");

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    const project = await Project.findById(bid.projectId).populate("client", "email");

    if (!project || !project.client) {
      return res.status(404).json({ error: "Client not found for the project." });
    }

    // Log the activity
    await Activity.create({
      userId: bid.freelancerId._id,
      action: `You accepted the project "${project.title}" for $${bid.amount}.`,
    });

    // Create a notification for the client
    await Notification.create({
      user: project.client._id, // Client ID
      message: `${bid.freelancerId.email} has accepted the project named ${project.title} for $${bid.amount} using bid.`,
    });

    res.status(200).json({ message: "Bid accepted successfully. Now, work on this project maintaining deadline!", bid });
  } catch (error) {
    console.error("Error accepting bid:", error);
    res.status(500).json({ error: "Failed to accept bid." });
  }
});

// Route to reject a selected bid
router.delete("/reject/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate("projectId");

    if (!bid) {
      return res.status(404).json({ error: "Bid not found." });
    }

    if (bid.status !== "pending" && bid.status !== "selected") {
      return res.status(400).json({ error: "The bid has already been accepted and cannot be rejected." });
    }

    await bid.deleteOne();

    // Notify the client
    await Notification.create({
      user: bid.projectId.client,
      message: `The selected bid for your project "${bid.projectId.title}" has been rejected by the freelancer.`,
    });

    // Log the activity for the client
    await Activity.create({
      userId: bid.freelancerId._id,
      action: `You have rejected the bid for the project "${bid.projectId.title}"`,
    });

    res.status(200).json({ message: "Bid rejected successfully." });
  } catch (error) {
    console.error("Error rejecting bid:", error);
    res.status(500).json({ error: "Failed to reject bid." });
  }
});

// Route to update a bid
router.put("/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;
    const { bidAmount } = req.body;
    const freelancerId = req.user.id;

    // Find the bid and check its status
    const bid = await Bid.findOne({ _id: bidId, freelancerId });
    if (!bid) {
      return res.status(404).json({ error: "Bid not found or you are not authorized to update this bid." });
    }

    if (bid.status !== "pending") {
      return res.status(400).json({ error: "Your previous bid was selected, so you cannot update your bid on this project!" });
    }

    // Update the bid
    bid.amount = bidAmount;
    await bid.save();

    const project = await Project.findById(bid.projectId).populate("client", "email");
    const freelancer = await User.findById(req.user.id).select("email");
    // Log the activity
    await Activity.create({
      userId: freelancerId,
      action: `You updated your bid to $${bidAmount} for project "${project.title}".`,
    });

    // Create a notification for the client
    await Notification.create({
      user: project.client._id, // Client ID
      message: `Freelancer (${freelancer.email}) has updated their bid for project "${project.title}".`,
    });

    res.status(200).json({ message: "Bid updated successfully.", bid });
  } catch (error) {
    console.error("Error updating bid:", error);
    res.status(500).json({ error: "Failed to update bid." });
  }
});

// Route to delete a bid
router.delete("/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;
    const freelancerId = req.user.id;

    // Find the bid
    const bid = await Bid.findOne({ _id: bidId, freelancerId });

    if (!bid) {
      return res.status(404).json({ error: "Bid not found or you are not authorized to delete this bid." });
    }

    // Check if the bid status is not "pending" or "selected"
    if (bid.status !== "pending" && bid.status !== "selected") {
      return res.status(400).json({ error: "The bid has already been accepted and cannot be deleted." });
    }

    const project = await Project.findById(bid.projectId).populate("client", "email");

    // Delete the bid
    await bid.deleteOne();

    // Log the activity
    await Activity.create({
      userId: freelancerId,
      action: `You deleted your bid for project "${project.title}".`,
    });

    // Create a notification for the client
    await Notification.create({
      user: project.client._id, // Client ID
      message: `Freelancer (${req.user.email}) has deleted their bid for project "${project.title}".`,
    });

    res.status(200).json({ message: "Bid deleted successfully." });
  } catch (error) {
    console.error("Error deleting bid:", error);
    res.status(500).json({ error: "Failed to delete bid." });
  }
});

module.exports = router;