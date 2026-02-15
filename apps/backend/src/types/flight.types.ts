// Flight related types

import type { Flight, FlightFare, FlightBooking } from "@repo/database";

export interface FlightSearchFilters {
  fromCity: string;
  toCity: string;
  departureDate: Date;
  returnDate?: Date;
  passengers?: number;
  fareClass?: string;
  airline?: string;
  maxPrice?: number;
  maxStops?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FlightWithFares extends Flight {
  fares: FlightFare[];
}

export interface FlightSearchResult {
  flight: Flight;
  availableFares: FlightFare[];
  lowestPrice: number;
}

export interface CreateFlightBookingInput {
  userId: string;
  flightId: string;
  fareClass: string;
  passengers: number;
  passengerDetails?: Record<string, unknown>;
}

export interface FlightBookingDetails extends FlightBooking {
  flight: Flight;
}
