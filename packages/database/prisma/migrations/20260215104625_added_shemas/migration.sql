/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('STANDARD', 'DELUXE', 'SUPER_DELUXE', 'SUITE', 'PRESIDENTIAL_SUITE', 'EXECUTIVE', 'FAMILY', 'SINGLE', 'DOUBLE', 'TWIN');

-- CreateEnum
CREATE TYPE "FareClass" AS ENUM ('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST_CLASS');

-- CreateEnum
CREATE TYPE "TrainClassType" AS ENUM ('SL', 'AC3', 'AC2', 'AC1', 'CC', 'EC', 'GENERAL');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET', 'PAY_LATER', 'CASH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Hotel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "starRating" SMALLINT,
    "images" TEXT[],
    "amenities" TEXT[],
    "policies" TEXT,
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "roomType" "RoomType" NOT NULL,
    "bedType" TEXT,
    "maxGuests" INTEGER NOT NULL DEFAULT 2,
    "sizeSqft" INTEGER,
    "images" TEXT[],
    "amenities" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomRate" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "available" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "checkInDate" DATE NOT NULL,
    "checkOutDate" DATE NOT NULL,
    "guests" INTEGER NOT NULL,
    "guestDetails" JSONB,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "specialRequests" TEXT,
    "bookingReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL,
    "flightNumber" TEXT NOT NULL,
    "airline" TEXT NOT NULL,
    "airlineCode" TEXT NOT NULL,
    "fromAirport" TEXT NOT NULL,
    "fromCity" TEXT NOT NULL,
    "toAirport" TEXT NOT NULL,
    "toCity" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "stopDetails" JSONB,
    "aircraftType" TEXT,
    "baggageInfo" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightFare" (
    "id" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "fareClass" "FareClass" NOT NULL DEFAULT 'ECONOMY',
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "seatsAvailable" INTEGER NOT NULL DEFAULT 0,
    "amenities" TEXT[],
    "isRefundable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightFare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "fareClass" "FareClass" NOT NULL DEFAULT 'ECONOMY',
    "passengers" INTEGER NOT NULL,
    "passengerDetails" JSONB,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "seatNumbers" TEXT[],
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "bookingReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Train" (
    "id" TEXT NOT NULL,
    "trainNumber" TEXT NOT NULL,
    "trainName" TEXT NOT NULL,
    "fromStation" TEXT NOT NULL,
    "fromCity" TEXT NOT NULL,
    "toStation" TEXT NOT NULL,
    "toCity" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "arrivalTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "daysOfWeek" INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Train_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainClass" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "classType" "TrainClassType" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "seatsAvailable" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "classType" "TrainClassType" NOT NULL,
    "passengers" INTEGER NOT NULL,
    "passengerDetails" JSONB,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "seatNumbers" TEXT[],
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "pnrNumber" TEXT,
    "bookingReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hotelId" TEXT,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "images" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "transactionId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "hotelBookingId" TEXT,
    "flightBookingId" TEXT,
    "trainBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hotel_city_idx" ON "Hotel"("city");

-- CreateIndex
CREATE INDEX "Hotel_country_idx" ON "Hotel"("country");

-- CreateIndex
CREATE INDEX "Hotel_starRating_idx" ON "Hotel"("starRating");

-- CreateIndex
CREATE INDEX "Hotel_isActive_idx" ON "Hotel"("isActive");

-- CreateIndex
CREATE INDEX "Room_hotelId_idx" ON "Room"("hotelId");

-- CreateIndex
CREATE INDEX "Room_roomType_idx" ON "Room"("roomType");

-- CreateIndex
CREATE INDEX "RoomRate_roomId_idx" ON "RoomRate"("roomId");

-- CreateIndex
CREATE INDEX "RoomRate_date_idx" ON "RoomRate"("date");

-- CreateIndex
CREATE INDEX "RoomRate_price_idx" ON "RoomRate"("price");

-- CreateIndex
CREATE UNIQUE INDEX "RoomRate_roomId_date_key" ON "RoomRate"("roomId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HotelBooking_bookingReference_key" ON "HotelBooking"("bookingReference");

-- CreateIndex
CREATE INDEX "HotelBooking_userId_idx" ON "HotelBooking"("userId");

-- CreateIndex
CREATE INDEX "HotelBooking_hotelId_idx" ON "HotelBooking"("hotelId");

-- CreateIndex
CREATE INDEX "HotelBooking_checkInDate_idx" ON "HotelBooking"("checkInDate");

-- CreateIndex
CREATE INDEX "HotelBooking_status_idx" ON "HotelBooking"("status");

-- CreateIndex
CREATE INDEX "HotelBooking_bookingReference_idx" ON "HotelBooking"("bookingReference");

-- CreateIndex
CREATE INDEX "Flight_fromCity_idx" ON "Flight"("fromCity");

-- CreateIndex
CREATE INDEX "Flight_toCity_idx" ON "Flight"("toCity");

-- CreateIndex
CREATE INDEX "Flight_departureTime_idx" ON "Flight"("departureTime");

-- CreateIndex
CREATE INDEX "Flight_airline_idx" ON "Flight"("airline");

-- CreateIndex
CREATE INDEX "FlightFare_flightId_idx" ON "FlightFare"("flightId");

-- CreateIndex
CREATE INDEX "FlightFare_fareClass_idx" ON "FlightFare"("fareClass");

-- CreateIndex
CREATE INDEX "FlightFare_price_idx" ON "FlightFare"("price");

-- CreateIndex
CREATE UNIQUE INDEX "FlightBooking_bookingReference_key" ON "FlightBooking"("bookingReference");

-- CreateIndex
CREATE INDEX "FlightBooking_userId_idx" ON "FlightBooking"("userId");

-- CreateIndex
CREATE INDEX "FlightBooking_flightId_idx" ON "FlightBooking"("flightId");

-- CreateIndex
CREATE INDEX "FlightBooking_status_idx" ON "FlightBooking"("status");

-- CreateIndex
CREATE INDEX "FlightBooking_bookingReference_idx" ON "FlightBooking"("bookingReference");

-- CreateIndex
CREATE UNIQUE INDEX "Train_trainNumber_key" ON "Train"("trainNumber");

-- CreateIndex
CREATE INDEX "Train_fromCity_idx" ON "Train"("fromCity");

-- CreateIndex
CREATE INDEX "Train_toCity_idx" ON "Train"("toCity");

-- CreateIndex
CREATE INDEX "Train_trainNumber_idx" ON "Train"("trainNumber");

-- CreateIndex
CREATE INDEX "TrainClass_trainId_idx" ON "TrainClass"("trainId");

-- CreateIndex
CREATE INDEX "TrainClass_classType_idx" ON "TrainClass"("classType");

-- CreateIndex
CREATE UNIQUE INDEX "TrainBooking_pnrNumber_key" ON "TrainBooking"("pnrNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TrainBooking_bookingReference_key" ON "TrainBooking"("bookingReference");

-- CreateIndex
CREATE INDEX "TrainBooking_userId_idx" ON "TrainBooking"("userId");

-- CreateIndex
CREATE INDEX "TrainBooking_trainId_idx" ON "TrainBooking"("trainId");

-- CreateIndex
CREATE INDEX "TrainBooking_pnrNumber_idx" ON "TrainBooking"("pnrNumber");

-- CreateIndex
CREATE INDEX "TrainBooking_bookingReference_idx" ON "TrainBooking"("bookingReference");

-- CreateIndex
CREATE INDEX "Review_hotelId_idx" ON "Review"("hotelId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_hotelBookingId_key" ON "Payment"("hotelBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_flightBookingId_key" ON "Payment"("flightBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_trainBookingId_key" ON "Payment"("trainBookingId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomRate" ADD CONSTRAINT "RoomRate_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightFare" ADD CONSTRAINT "FlightFare_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainClass" ADD CONSTRAINT "TrainClass_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainBooking" ADD CONSTRAINT "TrainBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainBooking" ADD CONSTRAINT "TrainBooking_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_hotelBookingId_fkey" FOREIGN KEY ("hotelBookingId") REFERENCES "HotelBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_flightBookingId_fkey" FOREIGN KEY ("flightBookingId") REFERENCES "FlightBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_trainBookingId_fkey" FOREIGN KEY ("trainBookingId") REFERENCES "TrainBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
