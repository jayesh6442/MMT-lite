// Train related types

import type { Train, TrainClass, TrainBooking } from "@repo/database";

export interface TrainSearchFilters {
  fromCity: string;
  toCity: string;
  departureDate: Date;
  classType?: string;
  passengers?: number;
}

export interface TrainWithClasses extends Train {
  classes: TrainClass[];
}

export interface TrainSearchResult {
  train: Train;
  availableClasses: TrainClass[];
  lowestPrice: number;
}

export interface CreateTrainBookingInput {
  userId: string;
  trainId: string;
  classType: string;
  passengers: number;
  passengerDetails?: Record<string, unknown>;
}

export interface TrainBookingDetails extends TrainBooking {
  train: Train;
}
