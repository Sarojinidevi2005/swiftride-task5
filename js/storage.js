/* ============================================================
   SwiftRide — storage.js
   Central localStorage data layer shared by every page.
   Handles: booking history, customer info, theme preference,
   selected vehicle, pickup/drop, and the vehicle fleet catalogue.
   ============================================================ */

const SwiftStorage = (function () {
  const KEYS = {
    BOOKINGS: 'swiftride_bookings',
    CUSTOMER: 'swiftride_customer',
    THEME: 'swiftride_theme',
    SELECTED_VEHICLE: 'swiftride_selected_vehicle',
    PICKUP: 'swiftride_pickup',
    DROP: 'swiftride_drop',
    RIDE_TASKS: 'swiftride_ride_tasks',
  };

  /* ---------- Safe generic helpers ---------- */
  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('SwiftStorage: failed to read', key, e);
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('SwiftStorage: failed to write', key, e);
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) { /* ignore */ }
  }

  /* ---------- Bookings ---------- */
  function getBookings() {
    const data = safeGet(KEYS.BOOKINGS, []);
    return Array.isArray(data) ? data : [];
  }

  function saveBookings(bookings) {
    safeSet(KEYS.BOOKINGS, bookings);
  }

  function addBooking(booking) {
    const bookings = getBookings();
    bookings.unshift(booking); // newest first
    saveBookings(bookings);
    return booking;
  }

  function deleteBooking(id) {
    const bookings = getBookings().filter(b => b.id !== id);
    saveBookings(bookings);
  }

  function updateBookingStatus(id, status) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      booking.status = status;
      saveBookings(bookings);
    }
    return booking;
  }

  function getBookingById(id) {
    return getBookings().find(b => b.id === id);
  }

  /* ---------- Customer info (last used, for auto-fill) ---------- */
  function getCustomer() {
    return safeGet(KEYS.CUSTOMER, { name: '', phone: '' });
  }

  function saveCustomer(customer) {
    safeSet(KEYS.CUSTOMER, customer);
  }

  /* ---------- Theme preference ---------- */
  function getTheme() {
    return safeGet(KEYS.THEME, 'light');
  }

  function saveTheme(theme) {
    safeSet(KEYS.THEME, theme);
  }

  /* ---------- Selected vehicle / pickup / drop (cross-page handoff) ---------- */
  function getSelectedVehicle() {
    return safeGet(KEYS.SELECTED_VEHICLE, null);
  }

  function saveSelectedVehicle(vehicleType) {
    safeSet(KEYS.SELECTED_VEHICLE, vehicleType);
  }

  function getPickup() {
    return safeGet(KEYS.PICKUP, '');
  }

  function savePickup(val) {
    safeSet(KEYS.PICKUP, val);
  }

  function getDrop() {
    return safeGet(KEYS.DROP, '');
  }

  function saveDrop(val) {
    safeSet(KEYS.DROP, val);
  }

  /* ---------- Ride planner tasks (Home page widget) ---------- */
  function getRideTasks() {
    const data = safeGet(KEYS.RIDE_TASKS, []);
    return Array.isArray(data) ? data : [];
  }

  function saveRideTasks(tasks) {
    safeSet(KEYS.RIDE_TASKS, tasks);
  }

  /* ---------- Booking ID + Fare helpers (shared by booking, fleet, pricing) ---------- */

  // Generates a unique, human-friendly booking ID e.g. SR-4F82K9-3T
  function generateBookingId() {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `SR-${ts}-${rand}`;
  }

  // Deterministic pseudo-distance (km) derived from pickup+drop text so the
  // same route always estimates the same distance. Range: 3km - 42km.
  function estimateDistance(pickup, drop) {
    const str = (pickup.trim() + '|' + drop.trim()).toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    const km = 3 + (hash % 3900) / 100; // 3.00 - 41.99
    return Math.round(km * 10) / 10;
  }

  function calculateFare(pickup, drop, vehicleType) {
    const vehicle = VEHICLES.find(v => v.type === vehicleType) || VEHICLES[0];
    const distance = estimateDistance(pickup || 'default-pickup', drop || 'default-drop');
    const baseFare = vehicle.baseFare;
    const perKmCharge = Math.round(distance * vehicle.pricePerKm);
    const total = baseFare + perKmCharge;
    return {
      distance,
      baseFare,
      perKmCharge,
      total,
      vehicle,
    };
  }

  /* ---------- Vehicle fleet catalogue ---------- */
  const VEHICLES = [
    {
      id: 'v1', name: 'Swift Mini', type: 'Mini', seats: 4, ac: true,
      pricePerKm: 9, baseFare: 40, rating: 4.6,
      img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v2', name: 'City Hatch', type: 'Mini', seats: 4, ac: true,
      pricePerKm: 9, baseFare: 40, rating: 4.4,
      img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v3', name: 'Swift Sedan', type: 'Sedan', seats: 4, ac: true,
      pricePerKm: 12, baseFare: 55, rating: 4.8,
      img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v4', name: 'Comfort Sedan', type: 'Sedan', seats: 4, ac: true,
      pricePerKm: 12, baseFare: 55, rating: 4.7,
      img: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v5', name: 'Swift SUV', type: 'SUV', seats: 6, ac: true,
      pricePerKm: 18, baseFare: 80, rating: 4.9,
      img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v6', name: 'Family SUV', type: 'SUV', seats: 7, ac: true,
      pricePerKm: 19, baseFare: 85, rating: 4.7,
      img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v7', name: 'Swift Prestige', type: 'Luxury', seats: 4, ac: true,
      pricePerKm: 28, baseFare: 150, rating: 5.0,
      img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v8', name: 'Royal Cruiser', type: 'Luxury', seats: 4, ac: true,
      pricePerKm: 30, baseFare: 160, rating: 4.9,
      img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=70',
    },
    {
      id: 'v9', name: 'Quick Auto', type: 'Auto', seats: 3, ac: false,
      pricePerKm: 6, baseFare: 25, rating: 4.3,
      img: 'https://truckcdn.cardekho.com/in/bajaj/compact-4s/bajaj-compact-4s-48935.jpg?impolicy=resize&imwidth=420',
    },
    {
      id: 'v10', name: 'City Auto', type: 'Auto', seats: 3, ac: false,
      pricePerKm: 6, baseFare: 25, rating: 4.2,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeKYrOmx9VjTs9TsneRMKzq-ZszSfCZ9Ph9I69JnCOsw&s=10',
    },
  ];

  return {
    KEYS,
    VEHICLES,
    getBookings, saveBookings, addBooking, deleteBooking, updateBookingStatus, getBookingById,
    getCustomer, saveCustomer,
    getTheme, saveTheme,
    getSelectedVehicle, saveSelectedVehicle,
    getPickup, savePickup,
    getDrop, saveDrop,
    getRideTasks, saveRideTasks,
    generateBookingId, estimateDistance, calculateFare,
    safeRemove,
  };
})();
