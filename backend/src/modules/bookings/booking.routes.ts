import { Router } from "express";
import { 
  rentProperty, 
  cancelBooking, 
  getMyBookings 
} from "./booking.controller";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();

// Get list of all my bookings (as renter or owner)
router.get("/my-bookings", verifyToken, getMyBookings);

// Create a new booking
router.post("/rent", verifyToken, rentProperty);

// Cancel an existing booking
router.patch("/:bookingId/cancel", verifyToken, cancelBooking);

export default router;