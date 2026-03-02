import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// CREATE BOOKING & INITIALIZE CHAT
export const rentProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    const renterId = (req as any).user?.userId;

    // 1. Find the property to get the ownerId
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true, title: true }
    });

    if (!property) return res.status(404).json({ message: "Property not found" });
    if (property.ownerId === renterId) return res.status(400).json({ message: "You cannot rent your own property" });

    // 2. Create the Booking
    const booking = await prisma.booking.create({
      data: {
        propertyId,
        renterId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: "pending"
      }
    });

    // 3. Handle Chat Initialization
    let chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: renterId } } },
          { participants: { some: { userId: property.ownerId } } }
        ]
      }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          participants: {
            create: [
              { userId: renterId },
              { userId: property.ownerId }
            ]
          }
        }
      });

      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: renterId,
          message: `Hi! I just requested to rent "${property.title}". Can we discuss the details?`,
          isAi: false
        }
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking successful! Chat initiated with owner.",
      data: { booking, chatId: chat.id }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// CANCEL BOOKING
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const userId = (req as any).user?.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: { select: { ownerId: true } } }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const isRenter = booking.renterId === userId;
    const isOwner = booking.property.ownerId === userId;

    if (!isRenter && !isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to cancel this booking" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" }
    });

    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: booking.renterId } } },
          { participants: { some: { userId: booking.property.ownerId } } }
        ]
      }
    });

    if (chat) {
      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: userId,
          message: `🚫 This booking has been cancelled by the ${isRenter ? 'renter' : 'owner'}.`,
          isAi: false
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET USER'S BOOKINGS (History)
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { renterId: userId },
          { property: { ownerId: userId } }
        ]
      },
      include: {
        property: {
          include: { media: { take: 1 } } // Get first image for thumbnail
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};