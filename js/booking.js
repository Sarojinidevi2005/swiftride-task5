/* ============================================================
   SwiftRide — booking.js
   Powers the Booking page: populates the vehicle dropdown,
   restores saved data from localStorage, validates the form,
   generates a Booking ID + fare estimate, saves the booking to
   history, and renders the Booking Summary panel.
   ============================================================ */

const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  const taxiTypeSelect = document.getElementById('taxiType');
  const fullNameField = document.getElementById('fullName');
  const phoneField = document.getElementById('phone');
  const pickupField = document.getElementById('pickup');
  const dropField = document.getElementById('drop');
  const rideDateField = document.getElementById('rideDate');
  const rideTimeField = document.getElementById('rideTime');

  /* ---------- Populate vehicle type dropdown from the fleet catalogue ---------- */
  function populateVehicleOptions() {
    if (!taxiTypeSelect) return;
    const types = [...new Set(SwiftStorage.VEHICLES.map(v => v.type))];
    taxiTypeSelect.innerHTML = '<option value="">— Select a vehicle —</option>' +
      types.map(type => {
        const sample = SwiftStorage.VEHICLES.find(v => v.type === type);
        return `<option value="${type}">${type} (up to ${sample.seats} pax) — ₹${sample.pricePerKm}/km</option>`;
      }).join('');
  }
  populateVehicleOptions();

  /* ---------- Restore saved data (customer info, pickup, drop, vehicle) ---------- */
  function restoreSavedData() {
    const customer = SwiftStorage.getCustomer();
    if (customer.name && fullNameField) fullNameField.value = customer.name;
    if (customer.phone && phoneField) phoneField.value = customer.phone;

    const pickup = SwiftStorage.getPickup();
    const drop = SwiftStorage.getDrop();
    if (pickup && pickupField) pickupField.value = pickup;
    if (drop && dropField) dropField.value = drop;

    const selectedVehicle = SwiftStorage.getSelectedVehicle();
    if (selectedVehicle && taxiTypeSelect) taxiTypeSelect.value = selectedVehicle;
  }
  restoreSavedData();

  // Set minimum date to today
  if (rideDateField) {
    const today = new Date().toISOString().split('T')[0];
    rideDateField.setAttribute('min', today);
  }

  // Persist pickup / drop / vehicle as the user types, so Fleet <-> Booking stay in sync
  if (pickupField) pickupField.addEventListener('input', () => SwiftStorage.savePickup(pickupField.value));
  if (dropField) dropField.addEventListener('input', () => SwiftStorage.saveDrop(dropField.value));
  if (taxiTypeSelect) taxiTypeSelect.addEventListener('change', () => SwiftStorage.saveSelectedVehicle(taxiTypeSelect.value));

  /* ---------- Live validation ---------- */
  SwiftValidate.wireLiveValidation({
    fullName: { err: 'nameErr' },
    phone: { err: 'phoneErr', check: SwiftValidate.isValidPhone },
    pickup: { err: 'pickupErr' },
    drop: { err: 'dropErr' },
    rideDate: { err: 'dateErr' },
    rideTime: { err: 'timeErr' },
    taxiType: { err: 'typeErr' },
  });

  /* ---------- Render the Booking Summary card ---------- */
  const summaryCard = document.getElementById('bookingSummaryCard');
  const summaryEls = summaryCard ? {
    id: document.getElementById('summaryId'),
    name: document.getElementById('summaryName'),
    phone: document.getElementById('summaryPhone'),
    pickup: document.getElementById('summaryPickup'),
    drop: document.getElementById('summaryDrop'),
    date: document.getElementById('summaryDate'),
    time: document.getElementById('summaryTime'),
    vehicle: document.getElementById('summaryVehicle'),
    distance: document.getElementById('summaryDistance'),
    baseFare: document.getElementById('summaryBaseFare'),
    perKm: document.getElementById('summaryPerKm'),
    total: document.getElementById('summaryTotal'),
    status: document.getElementById('summaryStatus'),
  } : null;

  function renderSummary(booking) {
    if (!summaryCard || !summaryEls) return;

    summaryEls.id.textContent = booking.id;
    summaryEls.name.textContent = booking.name;
    summaryEls.phone.textContent = booking.phone;
    summaryEls.pickup.textContent = booking.pickup;
    summaryEls.drop.textContent = booking.drop;
    summaryEls.date.textContent = formatDate(booking.date);
    summaryEls.time.textContent = formatTime(booking.time);
    summaryEls.vehicle.textContent = `${booking.vehicleName} (${booking.vehicleType})`;
    summaryEls.distance.textContent = `${booking.distance} km`;
    summaryEls.baseFare.textContent = `₹${booking.baseFare}`;
    summaryEls.perKm.textContent = `₹${booking.perKmCharge}`;
    summaryEls.total.textContent = `₹${booking.fare}`;

    summaryEls.status.textContent = booking.status;
    summaryEls.status.className = `status-badge status-${booking.status.toLowerCase()}`;

    summaryCard.classList.add('show');
    summaryCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = ((hour + 11) % 12) + 1;
    return `${displayHour}:${m} ${suffix}`;
  }

  /* ---------- Form submit ---------- */
  const bookBtn = document.getElementById('bookBtn');

  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const v1 = SwiftValidate.validateField('fullName', 'nameErr');
    const v2 = SwiftValidate.validateField('phone', 'phoneErr', SwiftValidate.isValidPhone);
    const v3 = SwiftValidate.validateField('pickup', 'pickupErr');
    const v4 = SwiftValidate.validateField('drop', 'dropErr');
    const v5 = SwiftValidate.validateField('rideDate', 'dateErr');
    const v6 = SwiftValidate.validateField('rideTime', 'timeErr');
    const v7 = SwiftValidate.validateField('taxiType', 'typeErr');

    if (!v1 || !v2 || !v3 || !v4 || !v5 || !v6 || !v7) {
      SwiftValidate.scrollToFirstError(bookingForm);
      return;
    }

    if (bookBtn) {
      bookBtn.disabled = true;
      bookBtn.innerHTML = '<i class="ph ph-spinner"></i> Confirming…';
    }

    const pickup = pickupField.value.trim();
    const drop = dropField.value.trim();
    const vehicleType = taxiTypeSelect.value;
    const fareInfo = SwiftStorage.calculateFare(pickup, drop, vehicleType);

    setTimeout(() => {
      const booking = {
        id: SwiftStorage.generateBookingId(),
        name: fullNameField.value.trim(),
        phone: phoneField.value.trim(),
        pickup,
        drop,
        date: rideDateField.value,
        time: rideTimeField.value,
        vehicleType,
        vehicleName: fareInfo.vehicle.name,
        distance: fareInfo.distance,
        baseFare: fareInfo.baseFare,
        perKmCharge: fareInfo.perKmCharge,
        fare: fareInfo.total,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
      };

      SwiftStorage.addBooking(booking);
      SwiftStorage.saveCustomer({ name: booking.name, phone: booking.phone });
      SwiftStorage.savePickup(pickup);
      SwiftStorage.saveDrop(drop);
      SwiftStorage.saveSelectedVehicle(vehicleType);

      if (bookBtn) {
        bookBtn.disabled = false;
        bookBtn.innerHTML = '<i class="ph ph-car-simple"></i> Confirm Booking';
      }

      renderSummary(booking);
      showToast('Booking Confirmed!', `Booking ID ${booking.id} — your driver will contact you shortly.`);

      bookingForm.reset();
      restoreSavedData(); // keep customer info + pickup/drop/vehicle pre-filled for convenience
    }, 800);
  });
}
