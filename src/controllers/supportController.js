import SupportTicket from "../models/SupportTicket.js";
import Report from "../models/reportModel.js";
import User from "../models/userModel.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

export const createSupportTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required.",
      });
    }

    let ticket;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const randomId = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;

      try {
        ticket = new SupportTicket({
          ticket_id: randomId,
          user_id: userId,
          subject,
          // message field is intentionally omitted now
          messages: [
            {
              sender: "user",
              message: message,
              created_at: new Date(),
            },
          ],
        });

        await ticket.save();
        break; // success, exit loop
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate ticket_id, try again
          attempts++;
        } else {
          throw error; // Some other error
        }
      }
    }

    if (!ticket) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to generate a unique ticket ID after multiple attempts.",
      });
    }

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserSupportTickets = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const tickets = await SupportTicket.find({ user_id: userId })
      .sort({ created_at: -1 })
      .select(
        "ticket_id subject status priority messages created_at updated_at"
      )
      .lean();

    const trimmedTickets = tickets.map((ticket) => {
      let latestUserMessage = null;
      let latestAdminMessage = null;

      // Loop through messages from end to start to find the latest of each
      for (let i = ticket.messages.length - 1; i >= 0; i--) {
        const msg = ticket.messages[i];
        if (!latestUserMessage && msg.sender === "user") {
          latestUserMessage = {
            sender: msg.sender,
            message: msg.message,
            created_at: msg.created_at,
          };
        } else if (
          !latestAdminMessage &&
          (msg.sender === "admin" || msg.sender === "moderator")
        ) {
          latestAdminMessage = {
            sender: msg.sender,
            message: msg.message,
            created_at: msg.created_at,
          };
        }

        if (latestUserMessage && latestAdminMessage) break;
      }

      return {
        ticket_id: ticket.ticket_id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        latestMessages: {
          user: latestUserMessage,
          admin: latestAdminMessage,
        },
      };
    });

    res.status(200).json({ success: true, tickets: trimmedTickets });
  } catch (error) {
    console.error("Get Tickets Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Report user
export const reportUser = async (req, res) => {
  console.log("report user api calling : ");
  try {
    const { reported_user, reason, description } = req.body;
    const reported_by = req.user._id;

    // Check if user is trying to report themselves
    if (reported_user === String(reported_by)) {
      return res.status(400).json({ error: "You cannot report yourself." });
    }

    // Optional: Check if reported user exists
    const userExists = await User.findById(reported_user);
    if (!userExists) {
      return res
        .status(404)
        .json({ error: "The user you are trying to report does not exist." });
    }

    // Create report
    const newReport = new Report({
      reported_user,
      reported_by,
      reason,
      description,
    });

    await newReport.save();

    res.status(201).json({
      message: "Report submitted successfully.",
      report: newReport,
    });
  } catch (error) {
    console.error("Error reporting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
