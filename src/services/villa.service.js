import dayjs from "dayjs";
import Villa from "../models/Villa.js";
import VillaCalendar from "../models/VillaCalendar.js";

export const fetchAvailableVillas = async ({
  check_in,
  check_out,
  location,
  page = 1,
  limit = 10,
  sort = "avg_price_per_night",
  order = "asc",
}) => {
  const hasDates = check_in && check_out;

  let nights = null;
  let villaMap = {};
  let data = [];

  // =========================
  // CASE 1️⃣ — DATES PROVIDED
  // =========================
  if (hasDates) {
    const checkIn = dayjs(check_in);
    const checkOut = dayjs(check_out);

    if (!checkIn.isValid() || !checkOut.isValid()) {
      throw new Error("Invalid date format");
    }

    nights = checkOut.diff(checkIn, "day");
    if (nights <= 0) {
      throw new Error("check_out must be after check_in");
    }

    // Get calendar rows in range
    const calendarRows = await VillaCalendar.find({
      date: {
        $gte: checkIn.toDate(),
        $lt: checkOut.toDate(),
      },
    });
    // If no calendar rows at all, return empty
if (!calendarRows.length) {
  return {
    meta: { page: Number(page), limit: Number(limit), total: 0 },
    data: [],
  };
}


    // Group by villa
    for (const row of calendarRows) {
      const id = row.villa_id.toString();

      if (!villaMap[id]) {
        villaMap[id] = {
          nights: 0,
          subtotal: 0,
          isAvailable: true,
        };
      }

      if (!row.is_available) {
        villaMap[id].isAvailable = false;
      }

      villaMap[id].nights += 1;
      villaMap[id].subtotal += row.rate;
    }

    // Filter fully available villas
    const availableVillaIds = Object.entries(villaMap)
      .filter(([_, v]) => v.isAvailable && v.nights === nights)
      .map(([id]) => id);

    // Fetch villa details
    const villas = await Villa.find({
      _id: { $in: availableVillaIds },
      ...(location ? { location } : {}),
    });

    data = villas.map((villa) => {
      const meta = villaMap[villa._id.toString()];
      return {
        id: villa._id,
        name: villa.name,
        location: villa.location,
        nights,
        subtotal: meta.subtotal,
        avg_price_per_night: Math.round(meta.subtotal / nights),
      };
    });
  }

  // =========================
  // CASE 2️⃣ — NO DATES
  // =========================
  else {
    const villas = await Villa.find(
      location ? { location } : {}
    );

    data = villas.map((villa) => ({
      id: villa._id,
      name: villa.name,
      location: villa.location,
      nights: null,
      subtotal: null,
      avg_price_per_night: villa.base_price || 0,
    }));
  }

  // =========================
  // SORTING
  // =========================
  data.sort((a, b) => {
    const dir = order === "desc" ? -1 : 1;
    return ((a[sort] || 0) - (b[sort] || 0)) * dir;
  });

  // =========================
  // PAGINATION
  // =========================
  const start = (page - 1) * limit;
  const paginated = data.slice(start, start + Number(limit));

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: data.length,
    },
    data: paginated,
  };
};


export const fetchVillaQuote = async (villaId, { check_in, check_out }) => {
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

  const villa = await Villa.findById(villaId);
  if (!villa) {
    throw new Error("villa_id not found");
  }

  const calendarRows = await VillaCalendar.find({
    villa_id: villaId,
    date: {
      $gte: checkIn.toDate(),
      $lt: checkOut.toDate(),
    },
  });

  const calendarMap = {};
  calendarRows.forEach(row => {
    calendarMap[dayjs(row.date).format("YYYY-MM-DD")] = row;
  });

  let subtotal = 0;
  let isAvailable = true;
  const nightly_breakdown = [];

  for (let i = 0; i < nights; i++) {
    const date = dayjs(checkIn).add(i, "day").format("YYYY-MM-DD");
    const row = calendarMap[date];

    if (row && row.is_available === false) {
      isAvailable = false;
    }

    const rate = row?.rate ?? villa.base_price;
    subtotal += rate;

    nightly_breakdown.push({
      date,
      rate,
      is_available: row?.is_available ?? true,
    });
  }

  const gst_rate = 0.18;
  const gst = isAvailable ? Math.round(subtotal * gst_rate) : 0;
  const total = isAvailable ? subtotal + gst : 0;

  return {
    villa: {
      id: villa._id,
      name: villa.name,
      location: villa.location,
    },
    check_in,
    check_out,
    nights,
    is_available: isAvailable,
    nightly_breakdown,
    subtotal: isAvailable ? subtotal : 0,
    gst_rate,
    gst,
    total,
  };
};

