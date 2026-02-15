// Hotel related types

import type {
  Hotel,
  Room,
  RoomRate,
  HotelBooking,
  Review,
} from "@repo/database";

export interface HotelSearchFilters {
  city?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  starRating?: number;
  amenities?: string[];
}

export interface HotelWithRooms extends Hotel {
  rooms: RoomWithRates[];
}

export interface RoomWithRates extends Room {
  rates: RoomRate[];
}

export interface HotelSearchResult {
  hotel: Hotel;
  rooms: RoomAvailability[];
  lowestPrice: number | null;
}

export interface RoomAvailability {
  room: Room;
  totalPrice: number;
  available: boolean;
  ratePerNight: number;
}

export interface CreateHotelBookingInput {
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  guestDetails?: Record<string, unknown>;
  specialRequests?: string;
}

export interface HotelBookingDetails extends HotelBooking {
  hotel: Hotel;
}
