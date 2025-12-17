import dayjs from "dayjs";
import Villa from "../models/Villa.js";
import VillaCalendar from "../models/VillaCalendar.js";

export const fetchAvailableVillas = async ({
  check_in,
  check_out,
  page = 1,
  limit = 10,
  sort = "avg_price_per_night",
  order = "asc"
}) => {
  // 1️⃣ Validate dates
  if (!check_in || !check_out) {
    throw new Error("check_in and check_out are required");
  }

  const checkIn = dayjs(check_in);
  const checkOut = dayjs(check_out);

  if (!checkIn.isValid() || !checkOut.isValid()) {
    throw new Error("Invalid date format");
  }

  const nights = checkOut.diff(checkIn, "day");
  if (nights <= 0) {
    throw new Error("check_out must be after check_in");
  }

  // 2️⃣ Get all calendar rows in range
  const calendarRows = await VillaCalendar.find({
    date: {
      $gte: checkIn.toDate(),
      $lt: checkOut.toDate()
    }
  });

  // 3️⃣ Group by villa
  const villaMap = {};

  for (const row of calendarRows) {
    const id = row.villa_id.toString();

    if (!villaMap[id]) {
      villaMap[id] = {
        nights: 0,
        subtotal: 0,
        isAvailable: true
      };
    }

    if (!row.is_available) {
      villaMap[id].isAvailable = false;
    }

    villaMap[id].nights += 1;
    villaMap[id].subtotal += row.rate;
  }

  // 4️⃣ Filter villas fully available for all nights
  const availableVillaIds = Object.entries(villaMap)
    .filter(([_, v]) => v.isAvailable && v.nights === nights)
    .map(([id]) => id);

  // 5️⃣ Fetch villa details
  const villas = await Villa.find({ _id: { $in: availableVillaIds } });

  // 6️⃣ Prepare response data
  let data = villas.map(villa => {
    const meta = villaMap[villa._id.toString()];
    return {
      id: villa._id,
      name: villa.name,
      location: villa.location,
      nights,
      subtotal: meta.subtotal,
      avg_price_per_night: Math.round(meta.subtotal / nights)
    };
  });

  // 7️⃣ Sorting
  data.sort((a, b) => {
    const dir = order === "desc" ? -1 : 1;
    return (a[sort] - b[sort]) * dir;
  });

  // 8️⃣ Pagination
  const start = (page - 1) * limit;
  const paginated = data.slice(start, start + Number(limit));

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: data.length
    },
    data: paginated
  };
};

export const fetchVillaQuote = async (villaId, { check_in, check_out }) => {
  // 1️⃣ Validate inputs
  if (!check_in || !check_out) {
    throw new Error("check_in and check_out are required");
  }

  const checkIn = dayjs(check_in);
  const checkOut = dayjs(check_out);

  if (!checkIn.isValid() || !checkOut.isValid()) {
    throw new Error("Invalid date format");
  }

  const nights = checkOut.diff(checkIn, "day");
  if (nights <= 0) {
    throw new Error("check_out must be after check_in");
  }

  // 2️⃣ Fetch villa
  const villa = await Villa.findById(villaId);
  if (!villa) {
    throw new Error("villa_id not found");
  }

  // 3️⃣ Fetch calendar rows for date range
  const calendarRows = await VillaCalendar.find({
    villa_id: villaId,
    date: {
      $gte: checkIn.toDate(),
      $lt: checkOut.toDate()
    }
  }).sort({ date: 1 });

  // Missing dates → unavailable
  if (calendarRows.length !== nights) {
    return {
      villa,
      check_in,
      check_out,
      nights,
      is_available: false,
      nightly_breakdown: []
    };
  }

  let subtotal = 0;
  let isAvailable = true;

  const nightly_breakdown = calendarRows.map(row => {
    if (!row.is_available) {
      isAvailable = false;
    }

    subtotal += row.rate;

    return {
      date: dayjs(row.date).format("YYYY-MM-DD"),
      rate: row.rate,
      is_available: row.is_available
    };
  });

  // 4️⃣ GST calculation
  const gst_rate = 0.18;
  const gst = isAvailable ? Math.round(subtotal * gst_rate) : 0;
  const total = isAvailable ? subtotal + gst : 0;

  return {
    villa: {
      id: villa._id,
      name: villa.name,
      location: villa.location
    },
    check_in,
    check_out,
    nights,
    is_available: isAvailable,
    nightly_breakdown,
    subtotal: isAvailable ? subtotal : 0,
    gst_rate,
    gst,
    total
  };
};
