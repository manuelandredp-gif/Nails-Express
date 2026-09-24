import {
  bookingService,
  CreateBookingDTO,
  normalizePhone,
  generateSecureBookingCode,
} from "./application/booking.service";

export type CreateBookingInput = CreateBookingDTO;
export { normalizePhone, generateSecureBookingCode as generateBookingCode };

export async function createBooking(input: CreateBookingInput) {
  return bookingService.createBooking(input);
}
