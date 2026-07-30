/* ============================================================
   SwiftRide — dashboard.js
   Powers the Customer Dashboard: reads all bookings from
   localStorage and renders summary stat cards, a per-vehicle-type
   statistics chart, and a recent bookings feed.
   ============================================================ */

const dashRoot = document.getElementById('dashboardRoot');

if (dashRoot) {
  function isUpcoming(b) {
    if (b.status === 'Cancelled' || b.status === 'Completed') return false;
    const rideDateTime = new Date(`${b.date}T${b.time || '00:00'}`);
    return rideDateTime.getTime() >= Date.now();
  }
  function isCompleted(b) {
    if (b.status === 'Completed') return true;
    if (b.status === 'Cancelled') return false;
    const rideDateTime = new Date(`${b.date}T${b.time || '00:00'}`);
    return rideDateTime.getTime() < Date.now();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function render() {
    const bookings = SwiftStorage.getBookings();

    const total = bookings.length;
    const upcoming = bookings.filter(isUpcoming).length;
    const completed = bookings.filter(isCompleted).length;

    document.getElementById('dashTotal').textContent = total;
    document.getElementById('dashUpcoming').textContent = upcoming;
    document.getElementById('dashCompleted').textContent = completed;

    // Favourite vehicle = most frequently booked type
    const typeCounts = {};
    bookings.forEach(b => { typeCounts[b.vehicleType] = (typeCounts[b.vehicleType] || 0) + 1; });
    const favouriteType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
    document.getElementById('dashFavourite').textContent = favouriteType || '—';

    // Last booking
    const lastBookingEl = document.getElementById('dashLastBooking');
    if (bookings.length === 0) {
      lastBookingEl.textContent = 'No bookings yet';
    } else {
      const sorted = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      lastBookingEl.textContent = `${sorted[0].pickup} → ${sorted[0].drop}`;
    }

    // Booking statistics bar chart (by vehicle type)
    const statsWrap = document.getElementById('dashStatsBars');
    const allTypes = [...new Set(SwiftStorage.VEHICLES.map(v => v.type))];
    const maxCount = Math.max(1, ...allTypes.map(t => typeCounts[t] || 0));

    if (total === 0) {
      statsWrap.innerHTML = `<div class="dash-empty"><i class="ph ph-chart-bar"></i><p>Book a ride to see your statistics here.</p></div>`;
    } else {
      statsWrap.innerHTML = allTypes.map(type => {
        const count = typeCounts[type] || 0;
        const pct = Math.round((count / maxCount) * 100);
        return `
        <div class="stat-bar-row">
          <span class="stat-bar-label">${type}</span>
          <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pct}%"></div></div>
          <span class="stat-bar-count">${count}</span>
        </div>`;
      }).join('');
    }

    // Recent bookings feed
    const recentWrap = document.getElementById('dashRecent');
    if (total === 0) {
      recentWrap.innerHTML = `<div class="dash-empty"><i class="ph ph-clock-counter-clockwise"></i><p>Your recent bookings will show up here.</p></div>`;
    } else {
      const recent = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      recentWrap.innerHTML = recent.map(b => `
        <div class="dash-recent-item">
          <div>
            <strong>${b.pickup} → ${b.drop}</strong>
            <span>${b.vehicleName} · ${formatDate(b.date)}</span>
          </div>
          <span class="status-badge status-${(b.status === 'Cancelled' ? 'cancelled' : isUpcoming(b) ? 'upcoming' : 'completed')}">
            ${b.status === 'Cancelled' ? 'Cancelled' : isUpcoming(b) ? 'Upcoming' : 'Completed'}
          </span>
        </div>`).join('');
    }
  }

  render();
}
