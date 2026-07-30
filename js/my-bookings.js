/* ============================================================
   SwiftRide — my-bookings.js
   Powers the My Bookings page: lists all bookings from
   localStorage, supports instant search, sorting, deleting,
   status updates, and an expandable details panel per booking.
   ============================================================ */

const bookingsList = document.getElementById('bookingsList');

if (bookingsList) {
  const searchInput = document.getElementById('bookingsSearch');
  const sortSelect = document.getElementById('bookingsSort');
  const countLabel = document.getElementById('bookingsCount');

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function deriveDisplayStatus(booking) {
    if (booking.status === 'Cancelled' || booking.status === 'Completed') return booking.status;
    const rideDateTime = new Date(`${booking.date}T${booking.time || '00:00'}`);
    return rideDateTime.getTime() < Date.now() ? 'Completed' : 'Upcoming';
  }

  function getFilteredSorted() {
    let list = SwiftStorage.getBookings().filter(b => b && b.id); // guard against malformed records
    const query = (searchInput.value || '').trim().toLowerCase();

    if (query) {
      list = list.filter(b =>
        (b.id || '').toLowerCase().includes(query) ||
        (b.name || '').toLowerCase().includes(query) ||
        (b.pickup || '').toLowerCase().includes(query) ||
        (b.drop || '').toLowerCase().includes(query) ||
        (b.vehicleType || '').toLowerCase().includes(query)
      );
    }

    const sortVal = sortSelect.value;
    if (sortVal === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortVal === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortVal === 'fare-high') list.sort((a, b) => b.fare - a.fare);
    else if (sortVal === 'fare-low') list.sort((a, b) => a.fare - b.fare);
    else if (sortVal === 'status') list.sort((a, b) => deriveDisplayStatus(a).localeCompare(deriveDisplayStatus(b)));

    return list;
  }

  function bookingRowHTML(b) {
    const status = deriveDisplayStatus(b);
    return `
    <div class="booking-row" data-id="${b.id}">
      <div class="booking-row-top">
        <div class="booking-row-id-wrap">
          <span class="booking-row-id">${b.id}</span>
          <span class="status-badge status-${status.toLowerCase()}">${status}</span>
        </div>
        <span style="font-size:0.78rem;color:var(--gray-400);">Booked on ${formatDate(b.createdAt.split('T')[0])}</span>
      </div>
      <div class="booking-row-grid">
        <div><span>Customer</span><strong>${b.name}</strong></div>
        <div><span>Vehicle</span><strong>${b.vehicleName}</strong></div>
        <div><span>Ride Date</span><strong>${formatDate(b.date)} · ${b.time}</strong></div>
        <div><span>Fare</span><strong>₹${b.fare}</strong></div>
      </div>
      <div class="booking-row-actions">
        <button class="btn btn-ghost btn-sm view-details-btn"><i class="ph ph-eye"></i> Details</button>
        ${status === 'Upcoming' ? `<button class="btn btn-ghost btn-sm cancel-btn"><i class="ph ph-x-circle"></i> Cancel</button>` : ''}
        <button class="btn btn-danger btn-sm delete-btn"><i class="ph ph-trash"></i> Delete</button>
      </div>
      <div class="booking-row-details">
        <div class="booking-row-grid">
          <div><span>Mobile</span><strong>${b.phone}</strong></div>
          <div><span>Pickup</span><strong>${b.pickup}</strong></div>
          <div><span>Drop</span><strong>${b.drop}</strong></div>
          <div><span>Distance</span><strong>${b.distance} km</strong></div>
          <div><span>Base Fare</span><strong>₹${b.baseFare}</strong></div>
          <div><span>Distance Charge</span><strong>₹${b.perKmCharge}</strong></div>
        </div>
      </div>
    </div>`;
  }

  function render() {
    const list = getFilteredSorted();
    countLabel.innerHTML = `<strong>${list.length}</strong> booking${list.length === 1 ? '' : 's'} found`;

    if (list.length === 0) {
      bookingsList.innerHTML = `
        <div class="bookings-empty">
          <i class="ph ph-clipboard-text"></i>
          <p>No bookings yet. <a href="booking.html" style="color:var(--yellow-dark);font-weight:700;">Book your first ride →</a></p>
        </div>`;
      return;
    }

    bookingsList.innerHTML = list.map(bookingRowHTML).join('');
    wireRowActions();
  }

  function wireRowActions() {
    bookingsList.querySelectorAll('.booking-row').forEach(row => {
      const id = row.dataset.id;

      row.querySelector('.view-details-btn').addEventListener('click', () => {
        row.querySelector('.booking-row-details').classList.toggle('open');
      });

      const cancelBtn = row.querySelector('.cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          if (confirm('Cancel this booking? This cannot be undone.')) {
            SwiftStorage.updateBookingStatus(id, 'Cancelled');
            showToast('Booking Cancelled', `Booking ${id} has been cancelled.`, 'error');
            render();
          }
        });
      }

      row.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('Permanently delete this booking record?')) {
          SwiftStorage.deleteBooking(id);
          showToast('Booking Deleted', `Booking ${id} was removed from your history.`);
          render();
        }
      });
    });
  }

  const debouncedRender = window.debounce ? window.debounce(render, 200) : render;
  searchInput.addEventListener('input', debouncedRender);
  sortSelect.addEventListener('change', render);

  const clearAllBtn = document.getElementById('clearAllBookings');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (SwiftStorage.getBookings().length === 0) return;
      if (confirm('Delete ALL bookings? This cannot be undone.')) {
        SwiftStorage.saveBookings([]);
        showToast('History Cleared', 'All bookings were removed.');
        render();
      }
    });
  }

  render();
}
