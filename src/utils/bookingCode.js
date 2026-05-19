// Format:
// BANGO +
// EventType (01 = Reg, 02 = Wedding) +
// PricePlan (01 = duration 3 hour, 02 = duration 5 hours) +
// Tanggal (YYMMDD) +
// Start Time (02, 14, 18) +
// End Time (05, 17, 21)

export function generateBookingCode(
  eventType,
  planDuration,
  eventDate,
  startTime,
  endTime,
) {
  const eventTypeCode = eventType === "WEDDING" ? "02" : "01";

  let durationCode;
  if (planDuration === 3) {
    durationCode = "01";
  } else if (planDuration === 5) {
    durationCode = "02";
  } else {
    durationCode = "00";
  }

  const yy = String(eventDate.getFullYear()).slice(-2);
  const mm = String(eventDate.getMonth() + 1).padStart(2, "0");
  const dd = String(eventDate.getDate()).padStart(2, "0");
  const dateCode = `${yy}${mm}${dd}`;

  // startTime and endTime are expected to be "HH:mm" string (slices in reservationService.js)
  const [startHour, startMinute] = startTime.split(":");
  const [endHour, endMinute] = endTime.split(":");
  const startCode = `${startHour.padStart(2, "0")}${startMinute.padStart(2, "0")}`;
  const endCode = `${endHour.padStart(2, "0")}${endMinute.padStart(2, "0")}`;

  return `BANGO${eventTypeCode}${durationCode}${dateCode}${startCode}${endCode}`;
}
