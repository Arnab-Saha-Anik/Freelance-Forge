const express = require("express");
const router = express.Router();
const Bid = require("../models/bidModel");
const Notification = require("../models/notificationModel"); // Import the Notification model
const { verifyToken } = require("../middleware/authMiddleware");

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

// Route to submit a bid for a project
router.post("/:projectId/bid", verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { bidAmount } = req.body;
    const freelancerId = req.user.id; // Assuming `verifyToken` adds `user` to `req`

    // Validate projectId as a valid ObjectId
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid project ID" });
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
    const bid = await Bid.findByIdAndUpdate(bidId, { status: "selected" }, { new: true }).populate("projectId");

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Create a notification for the freelancer
    await Notification.create({
      user: bid.freelancerId,
      message: `Your bid for project "${bid.projectId.title}" for $${bid.amount} has been accepted!`,
    });

    res.status(200).json({ message: "Bid selected successfully." });
  } catch (error) {
    console.error("Error selecting bid:", error);
    res.status(500).json({ error: "Failed to select bid" });
  }
});

// Route to accept a bid
router.put("/accept/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findByIdAndUpdate(bidId, { status: "accepted" });

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Create a notification for the client
    await Notification.create({
      user: bid.projectId.clientId,
      message: `The freelancer ${bid.freelancerId.email} has accepted the bid for project "${bid.projectId.title}".`,
    });

    res.status(200).json({ message: "Bid accepted successfully." });
  } catch (error) {
    console.error("Error accepting bid:", error);
    res.status(500).json({ error: "Failed to accept bid" });
  }
});

// Route to reject a bid
router.delete("/reject/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;
    const bid = await Bid.findByIdAndDelete(bidId);

    if (!bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // Create a notification for the client
    await Notification.create({
      user: bid.projectId.clientId,
      message: `The freelancer ${bid.freelancerId.email} has rejected the bid for project "${bid.projectId.title}".`,
    });

    res.status(200).json({ message: "Bid rejected successfully." });
  } catch (error) {
    console.error("Error rejecting bid:", error);
    res.status(500).json({ error: "Failed to reject bid" });
  }
});

// Route to update a bid
router.put("/:bidId", verifyToken, async (req, res) => {
  try {
    const { bidId } = req.params;
    const { bidAmount } = req.body;
    const freelancerId = req.user.id; // Assuming `verifyToken` adds `user` to `req`

    // Find the bid and ensure it belongs to the logged-in freelancer
    const bid = await Bid.findOneAndUpdate(
      { _id: bidId, freelancerId },
      { amount: bidAmount },
      { new: true }
    );

    if (!bid) {
      return res.status(404).json({ error: "Bid not found or you are not authorized to update this bid." });
    }

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
    const freelancerId = req.user.id; // Assuming `verifyToken` adds `user` to `req`

    // Find the bid and ensure it belongs to the logged-in freelancer
    const bid = await Bid.findOneAndDelete({ _id: bidId, freelancerId });

    if (!bid) {
      return res.status(404).json({ error: "Bid not found or you are not authorized to delete this bid." });
    }

    res.status(200).json({ message: "Bid deleted successfully." });
  } catch (error) {
    console.error("Error deleting bid:", error);
    res.status(500).json({ error: "Failed to delete bid." });
  }
});

module.exports = router;