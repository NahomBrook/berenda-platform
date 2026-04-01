// backend/src/modules/properties/property-availability.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkPropertyEligibility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.body;

    console.log("Checking availability for property:", id, { checkIn, checkOut, guests });

    // Validate input
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        eligible: false,
        message: "Check-in and check-out dates are required"
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        eligible: false,
        message: "Invalid date format"
      });
    }

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        eligible: false,
        message: "Check-out date must be after check-in date"
      });
    }

    // Get property details with bookings
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ["pending", "approved"] },
            AND: [
              { startDate: { lt: checkOutDate } },
              { endDate: { gt: checkInDate } }
            ]
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        eligible: false,
        message: "Property not found"
      });
    }

    // Check if property is available
    const hasConflictingBookings = property.bookings.length > 0;
    const isAvailable = property.isAvailable && !hasConflictingBookings;

    // Check guests limit
    const maxGuests = property.maxGuests || 10;
    const guestsValid = guests <= maxGuests;

    // Calculate price
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyRate = property.monthlyPrice / 30;
    const totalPrice = days * dailyRate;

    let message = "";
    if (!isAvailable) {
      message = hasConflictingBookings 
        ? "Property is not available for the selected dates" 
        : "Property is currently unavailable";
    } else if (!guestsValid) {
      message = `This property can accommodate up to ${maxGuests} guests`;
    } else {
      message = "Property is available for booking";
    }

    const result = {
      eligible: isAvailable && guestsValid,
      message: message,
      availableDates: isAvailable ? [{ start: checkIn, end: checkOut }] : [],
      price: {
        dailyRate: Number(dailyRate.toFixed(2)),
        nights: days,
        total: Number(totalPrice.toFixed(2))
      },
      property: {
        id: property.id,
        title: property.title,
        maxGuests: property.maxGuests,
        monthlyPrice: property.monthlyPrice
      }
    };

    return res.json(result);
  } catch (error) {
    console.error("Error checking availability:", error);
    return res.status(500).json({
      eligible: false,
      message: "Failed to check availability. Please try again."
    });
  }
};