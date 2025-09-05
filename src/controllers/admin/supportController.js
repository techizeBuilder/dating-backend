import SupportTicket from '../../models/SupportTicket.js';
import AdminProfile from '../../models/adminProfileModel.js';
// List all tickets
export const listTickets = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const tickets = await SupportTicket.find(query)
            .sort({ created_at: -1 })
            .populate('user_id', 'name profile_image')
            .populate('adminId', 'name role');

        const total = await SupportTicket.countDocuments(query);

        // Properly wait for all async operations inside map
        const formattedTickets = await Promise.all(
            tickets.map(async ticket => {
                const userMessages = ticket.messages?.filter(msg => msg.sender === 'user') || [];
                const latestUserMessage = userMessages.length
                    ? userMessages[userMessages.length - 1].message
                    : ticket.message;

                const formattedMessages = ticket.messages.map(msg => ({
                    sender: msg.sender,
                    message: msg.message,
                    created_at: msg.created_at.toISOString().split('T')[0]
                }));

                let admin = null;
                if (ticket.adminId) {
                    const adminProfile = await AdminProfile.findOne({ admin_id: ticket.adminId._id }).lean();
                    admin = {
                        _id: ticket.adminId._id,
                        name: ticket.adminId.name,
                        role: ticket.adminId.role,
                        profile_image: adminProfile?.profile_image || null
                    };
                }

                return {
                    id: ticket._id,
                    ticket_id: ticket.ticket_id,
                    user_id: ticket.user_id?._id || null,
                    user_name: ticket.user_id?.name || '',
                    profile_image: ticket.user_id?.profile_image || '',
                    admin,
                    subject: ticket.subject,
                    message: latestUserMessage,
                    priority: ticket.priority,
                    status: ticket.status,
                    messages: formattedMessages,
                    created_at: ticket.created_at.toISOString().split('T')[0],
                    updated_at: ticket.updated_at.toISOString().split('T')[0]
                };
            })
        );

        res.json({
            status: true,
            data: {
                tickets: formattedTickets
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};



// Reply to a ticket
export const replyToTicket = async (req, res) => {
    try {
        console.log('req.params', req.params)
        console.log('req.body', req.body)
        const { ticket_id } = req.params;
        const { message, sender, adminId } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ status: false, message: 'Reply message is required' });
        }

        const ticket = await SupportTicket.findOne({ ticket_id });
        if (!ticket) {
            return res.status(404).json({ status: false, message: 'Ticket not found' });
        }

        ticket.messages.push({
            sender: sender || 'admin',

            message,
            created_at: new Date()
        });
        ticket.adminId = adminId;



        await ticket.save();

        res.json({ status: true, message: 'Reply added successfully' });
    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ status: false, message: 'Server error' });
    }
};

// Update ticket status
export const updateStatus = async (req, res) => {
    try {
        const { ticket_id } = req.params;
        const { status } = req.body;

        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: false, message: 'Invalid status value' });
        }

        const ticket = await SupportTicket.findOneAndUpdate(
            { ticket_id },
            { status },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ status: false, message: 'Ticket not found' });
        }

        res.json({ status: true, message: 'Ticket status updated successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error' });
    }
};
export const getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.ticket_id)
            .populate('user_id', 'name');

        if (!ticket) {
            return res.status(404).json({ status: false, message: 'Ticket not found' });
        }

        // Filter and extract latest user message
        const userMessages = ticket.messages?.filter(msg => msg.sender === 'user') || [];
        const latestUserMessage = userMessages.length
            ? userMessages[userMessages.length - 1].message
            : ticket.message;

        // Format all messages
        const formattedMessages = ticket.messages.map(msg => ({
            sender: msg.sender,
            message: msg.message,
            created_at: msg.created_at.toISOString().split('T')[0]
        }));

        const formattedTicket = {
            id: ticket._id,
            ticket_id: ticket.ticket_id,
            user_id: ticket.user_id?._id?.toString() || ticket.user_id,
            user_name: ticket.user_id?.name || ticket.user_name,
            subject: ticket.subject,
            message: latestUserMessage,
            priority: ticket.priority,
            status: ticket.status,
            messages: formattedMessages,
            created_at: ticket.created_at.toISOString().split('T')[0],
            updated_at: ticket.updated_at.toISOString().split('T')[0]
        };

        return res.json({ status: true, data: formattedTicket });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Failed to fetch ticket details' });
    }
};
