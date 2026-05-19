import { prisma } from "../config/db.js";
import { generateBookingCode } from "../utils/bookingCode.js";

import dayjs from "dayjs";

export const createReservation = async (data) => {
  const {
    customerUuid,
    areaPricePlanId,
    eventType,
    duration,
    paxCount,
    eventDate,
    startTime,
    addonIds = [],
    corkageFee = 0,
  } = data;

  // 1. Validate and find customer by uuid
  const customer = await prisma.user.findUnique({
    where: { uuid: customerUuid },
  });
  if (!customer) {
    throw new Error("Customer not found.");
  }

  // 2. Date validation
  const today = dayjs().startOf("day");
  const bookDate = dayjs(eventDate).startOf("day");
  if (!bookDate.isAfter(today)) {
    throw new Error("Event date must be after today.");
  }
  if (bookDate.diff(today, "day") < 7) {
    throw new Error("Event date must be at least 7 days from today.");
  }

  // 3. Find area price plan
  const pricePlan = await prisma.areaPricePlan.findUnique({
    where: { id: areaPricePlanId },
    include: {
      areaType: true,
    },
  });
  if (!pricePlan) throw new Error("Area price plan not found.");

  // 4. Validate pax count
  if (paxCount > pricePlan.areaType.maxCapPax) {
    throw new Error("Pax co unt exceeds maximum capacity.");
  }

  // 5. Time parsing
  const eventDateObj = dayjs(eventDate);

  // Calculate endTime
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const endHour = startHour + pricePlan.planDuration;
  const normalizedStartTime = `${String(startHour).padStart(2, "0")}:${String(
    startMinute,
  ).padStart(2, "0")}`;
  const normalizedEndTime = `${String(endHour).padStart(2, "0")}:${String(
    startMinute,
  ).padStart(2, "0")}`;
  // Generate booking code
  const bookingCode = generateBookingCode(
    eventType,
    pricePlan.planDuration,
    eventDateObj.toDate(),
    normalizedStartTime,
    normalizedEndTime,
  );

  // Find Addon and calculate total addon
  let totalAddon = 0;
  let reservationAddons = [];

  if (addonIds && addonIds.length > 0) {
    const addonQtyMap = {};
    addonIds.forEach(({ id, quantity }) => {
      if (!addonQtyMap[id]) {
        addonQtyMap[id] = 0;
      }
      addonQtyMap[id] += quantity;
    });
    const addonIdList = Object.keys(addonQtyMap).map(Number);

    const addons = await prisma.addOn.findMany({
      where: { id: { in: addonIdList } },
    });

    reservationAddons = addons.map((addon) => {
      const qty = addonQtyMap[addon.id] || 0;
      const subtotal = addon.price * qty;
      totalAddon += subtotal;
      return {
        addonId: addon.id,
        qty,
        subtotal,
      };
    });
  }

  // Calculate total price
  const basePrice = pricePlan.planPrice;
  const totalPrice = basePrice + totalAddon + (corkageFee || 0);

  // 6. Calculate DP deadline (now + 1 day)
  const dpDeadline = dayjs().add(1, "day").toDate();

  // 7. Reservation creation with new status fields
  const dpAmount = 0.5 * totalPrice;
  const remainingAmount = totalPrice - dpAmount;
  const created = await prisma.reservation.create({
    data: {
      bookingCode,
      customerId: customer.id,
      areaPricePlanId,
      eventType,
      duration,
      paxCount,
      eventDate: eventDateObj.toDate(),
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      effectiveStartTime: `${String(startHour - 1).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
      effectiveEndTime: `${String(endHour + 1).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
      basePrice,
      totalAddon,
      corkageFee,
      totalPrice,
      reservationStatus: "PENDING_DP_PAYMENT",
      paymentStatus: "UNPAID",
      dpDeadline,
      dpAmount,
      remainingAmount,
    },
  });

  return created;
};
