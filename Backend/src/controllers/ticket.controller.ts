import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Ticket from "../models/ticket.model.js";
import EventBooking from "../models/eventBooking.model.js";
import Event from "../models/event.model.js";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { Resend } from "resend";

interface AuthRequest extends Request {
  user?: any;
}

const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new ApiError(500, "Failed to generate QR code");
  }
};

const generateTicketPDF = async (ticketData: any, qrCodeDataURL: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      if (!ticketData.event || !ticketData.user || !ticketData.ticketNumber) {
        throw new Error('Invalid ticket data structure');
      }
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.rect(0, 0, 595, 100)
         .fill('#667eea');
      
      doc.rect(0, 80, 595, 20)
         .fill('#764ba2');

      doc.fontSize(24)
         .fillColor('white')
         .text('Event Ticket', { align: 'center' });
      
      doc.fontSize(14)
         .text(`Your entry to ${ticketData.event?.title || 'Event'}`, { align: 'center' });

      doc.fontSize(20)
         .fillColor('#333')
         .text(ticketData.event?.title || 'Event')
         .moveDown(1);

      const eventDetails = [
        `Date: ${ticketData.event?.date ? new Date(ticketData.event.date).toLocaleDateString() : 'N/A'}`,
        `Time: ${ticketData.event?.time || 'N/A'}`,
        `Location: ${ticketData.event?.location || 'N/A'}`,
        `Price: $${ticketData.event?.price ?? 'N/A'}`,
        `Attendee: ${ticketData.user?.fullName || ticketData.user?.email || 'Guest'}`,
        `Event Type: ${(ticketData.event?.eventType || 'unknown').toString().charAt(0).toUpperCase() + (ticketData.event?.eventType || 'unknown').toString().slice(1)}`
      ];

      doc.fontSize(12)
         .fillColor('#666')
         .list(eventDetails, { 
           listType: 'none',
           bulletRadius: 0
         });

      if (ticketData.event?.eventType === 'online' && ticketData.event?.onlineDetails) {
        doc.moveDown(2)
           .fontSize(14)
           .fillColor('#1976d2')
           .text('Online Event Details');

        const onlineDetails = [
          `Platform: ${ticketData.event.onlineDetails.platform || 'Not specified'}`,
          `Link: ${ticketData.event.onlineDetails.link || 'N/A'}`
        ];

        if (ticketData.event.onlineDetails.password) {
          onlineDetails.push(`Password: ${ticketData.event.onlineDetails.password}`);
        }

        doc.fontSize(11)
           .fillColor('#333')
           .list(onlineDetails, { 
             listType: 'none',
             bulletRadius: 0
           });
      }

      doc.moveDown(2)
         .fontSize(16)
         .fillColor('#667eea')
         .text(`Ticket #${ticketData.ticketNumber}`, { align: 'center' });

      try {
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        
        // Use a fixed Y position instead of doc.y to avoid NaN issues
        const qrYPosition = 400; // Fixed position for QR code
        doc.image(qrBuffer, 247.5, qrYPosition, { width: 100, height: 100 });
        doc.moveDown(8);
      } catch (qrError) {
        console.error("QR Code rendering error:", qrError);
        doc.text('QR Code: ' + ticketData.ticketNumber, { align: 'center' });
      }

      doc.moveDown(2)
         .fontSize(10)
         .fillColor('#856404')
         .text('Security Note: This ticket is non-transferable and valid only for the attendee named above. Please keep this ticket secure and do not share it with others.', {
           width: 495,
           align: 'justify'
         });

      doc.fontSize(8)
         .fillColor('#999')
         .text('Generated on ' + new Date().toLocaleString(), { align: 'center' });

      doc.end();

    } catch (error) {
      console.error("PDF generation error:", error);
      reject(new ApiError(500, "Failed to generate ticket PDF"));
    }
  });
};

const sendTicketEmail = async (
  userEmail: string,
  ticketData: any,
  pdfBuffer: Buffer,
  qrCodeDataURL: string
): Promise<void> => {
  const { event, user, ticketNumber } = ticketData;
  console.log('ticket Number is ::' ,  ticketNumber);
  console.log('eventData in ticket',event)
  try {
    // const alreadySent = await Ticket.findOne({ ticketNumber });
    // if (alreadySent) {
    //   console.log(`Skipping: Email for ticket ${ticketNumber} already sent`);
    //   return;
    // }
    const resend = new Resend(process.env.RESEND_API_KEY);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎫 Your Event Ticket</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${event.title}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Hello ${user.fullName || user.email},
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for your purchase! Your ticket for <strong>${event.title}</strong> is attached to this email.
            Please keep this ticket safe and present it at the event entrance.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">📅 Event Details</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
          </div>

          ${
            event.eventType === "online" && event.onlineDetails
              ? `
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1976d2; margin-bottom: 15px;">🌐 Online Event Access</h3>
            <p><strong>Platform:</strong> ${event.onlineDetails.platform || "Not specified"}</p>
            <p><strong>Meeting Link:</strong> <a href="${event.onlineDetails.link}" style="color: #1976d2;">${event.onlineDetails.link}</a></p>
            ${
              event.onlineDetails.password
                ? `<p><strong>Password:</strong> ${event.onlineDetails.password}</p>`
                : ""
            }
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin: 25px 0;">
            <img src="${qrCodeDataURL}" alt="QR Code" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);" />
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>🔒 Security Note:</strong> This ticket is non-transferable and valid only for the attendee named above. 
              Please keep this ticket secure and do not share it with others.
            </p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 25px; text-align: center;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // sandbox sender
      to: userEmail,
      subject: `🎫 Your Event Ticket - ${event.title}`,
      html: htmlContent,
      attachments: [
        {
          filename: `ticket-${ticketNumber}.pdf`,
          content: pdfBuffer.toString("base64"), 
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });

    if (response.error) {
      throw new ApiError(500, `Resend error: ${response.error.message}`);
    }
  } catch (error: any) {
    console.error("Email sending error:", error);
    throw new ApiError(500, "Failed to send ticket email");
  }
};

const generateAndSendTickets = async (bookingId: string): Promise<void> => {
  let ticketNumber:string = ''
  try {
    console.log('genrate Ticket and send')
    const booking = await EventBooking.findById(bookingId)
    .populate('eventId')
    .populate('userId', 'name email');
    console.log("booking data from the genrate",  booking)
    console.log('booking got')
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }
    
    if (booking.paymentStatus !== 'paid') {
      throw new ApiError(400, "Payment not completed");
    }
    const event = await Event.findById(booking.eventId._id)
    console.log("event data from the genrate",  event)
    for (let i = 0; i < booking.numberOfTickets; i++) {
      ticketNumber = `TK-${uuidv4().substring(0, 8).toUpperCase()}`;
      const qrData = JSON.stringify({
        ticketNumber,
        bookingId: booking._id,
        eventId: booking.eventId._id,
        userId: booking.userId._id,
        timestamp: new Date().toISOString()
      });

      const qrCodeDataURL = await generateQRCode(qrData);

      const eventData: any = (booking.eventId as any).toObject ? (booking.eventId as any).toObject() : booking.eventId;
      const userData: any = (booking.userId as any).toObject ? (booking.userId as any).toObject() : booking.userId;

      const pdfBuffer = await generateTicketPDF({
        event: eventData,
        user: {
          fullName: userData.name,
          email: userData.email,
        },
        ticketNumber,
      }, qrCodeDataURL);

      const ticket = await Ticket.create({
        bookingId: booking._id,
        userId: booking.userId._id,
        eventId: booking.eventId._id,
        qrCode: qrCodeDataURL,
        ticketNumber,
        onlineDetails: eventData?.eventType === 'online' ? eventData?.onlineDetails : undefined
      });

      await sendTicketEmail(userData.email, {
        event: eventData,
        user: {
          fullName: userData.name,
          email: userData.email,
        },
        ticketNumber,
      }, pdfBuffer, qrCodeDataURL);
    }
  } catch (error) {
    console.error("Error generating tickets:", error);
    throw error;
  }
};

const getUserTickets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const tickets = await Ticket.find({ userId })
    .populate('eventId', 'title date time location eventType onlineDetails')
    .populate('bookingId', 'numberOfTickets totalPrice paymentStatus')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, "Tickets retrieved successfully", tickets));
});

const validateTicket = asyncHandler(async (req: Request, res: Response) => {
  const { ticketNumber } = req.params;

  if (!ticketNumber) {
    throw new ApiError(400, "Ticket number is required");
  }

  const ticket = await Ticket.findOne({ ticketNumber })
    .populate('eventId')
    .populate('bookingId')
    .populate('userId');

  if (!ticket) {
    throw new ApiError(404, "Invalid ticket");
  }

  if ((ticket.bookingId as any).paymentStatus !== 'paid') {
    throw new ApiError(400, "Ticket not valid - payment not completed");
  }

  const eventDate = new Date((ticket.eventId as any).date);
  if (eventDate < new Date()) {
    throw new ApiError(400, "Event has already passed");
  }

  res.status(200).json(new ApiResponse(200, "Ticket is valid", {
    ticket,
    event: ticket.eventId,
    attendee: ticket.userId
  }));
});

const cancelTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  const { bookingId } = req.params;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const booking = await EventBooking.findOne({
    _id: bookingId,
    userId
  }).populate('eventId');

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.paymentStatus !== 'paid') {
    throw new ApiError(400, "Only paid bookings can be cancelled");
  }
  const eventDate = new Date((booking.eventId as any).date);
  const hoursUntilEvent = (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);

  if (hoursUntilEvent < 24) {
    throw new ApiError(400, "Cancellation not allowed within 24 hours of event");
  }

  booking.status = 'cancelled';
  await booking.save();

  await Event.findByIdAndUpdate(
    booking.eventId._id,
    { $inc: { seats: booking.numberOfTickets } },
    { new: true }
  );

  await Ticket.updateMany(
    { bookingId: booking._id },
    { $set: { status: 'cancelled' } }
  );

  res.status(200).json(new ApiResponse(200, "Booking cancelled successfully", {
    booking,
    refundInfo: "Refund will be processed within 5-7 business days"
  }));
});

export { generateQRCode, generateTicketPDF, sendTicketEmail, generateAndSendTickets, getUserTickets, validateTicket, cancelTicket};