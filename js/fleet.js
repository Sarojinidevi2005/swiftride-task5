/* ============================================================
   SwiftRide — fleet.js
   Powers the Fleet page: renders vehicle cards from the shared
   catalogue, instant search by name/category, filtering by type,
   seating capacity, AC/Non-AC and price range, and sorting.
   ============================================================ */

const fleetGrid = document.getElementById('fleetGrid');

if (fleetGrid) {
  const searchInput = document.getElementById('fleetSearch');
  const typeFilter = document.getElementById('filterType');
  const seatsFilter = document.getElementById('filterSeats');
  const acFilter = document.getElementById('filterAC');
  const priceFilter = document.getElementById('filterPrice');
  const sortSelect = document.getElementById('sortFleet');
  const resultsCount = document.getElementById('fleetCount');

  /* ---------- Populate the "Vehicle Type" filter dynamically ---------- */
  function populateTypeFilter() {
    const types = [...new Set(SwiftStorage.VEHICLES.map(v => v.type))];
    typeFilter.innerHTML = '<option value="all">All Types</option>' +
      types.map(t => `<option value="${t}">${t}</option>`).join('');
  }
  populateTypeFilter();

  function ratingStars(rating) {
    return `<i class="ph-fill ph-star"></i> ${rating.toFixed(1)}`;
  }

  function vehicleCardHTML(v) {
    return `
    <div class="vehicle-card" data-id="${v.id}">
      <div class="vehicle-img-wrap">
        <img src="${v.img}" alt="${v.name}" loading="lazy">
        <span class="vehicle-type-tag">${v.type}</span>
        <span class="vehicle-ac-tag">${v.ac ? 'AC' : 'Non-AC'}</span>
      </div>
      <div class="vehicle-body">
        <h3>${v.name}</h3>
        <div class="vehicle-meta-row">
          <span><i class="ph ph-users"></i> ${v.seats} Seats</span>
          <span><i class="ph ph-snowflake"></i> ${v.ac ? 'AC' : 'Non-AC'}</span>
          <span class="vehicle-rating">${ratingStars(v.rating)}</span>
        </div>
        <div class="vehicle-footer">
          <div class="vehicle-price">₹${v.pricePerKm}<span>/km · ₹${v.baseFare} base</span></div>
          <button class="btn btn-primary btn-sm book-now-btn" data-type="${v.type}">
            <i class="ph ph-car-simple"></i> Book Now
          </button>
        </div>
      </div>
    </div>`;
  }

  function getFilteredSortedVehicles() {
    let list = [...SwiftStorage.VEHICLES];
    const query = (searchInput.value || '').trim().toLowerCase();

    if (query) {
      list = list.filter(v =>
        v.name.toLowerCase().includes(query) || v.type.toLowerCase().includes(query)
      );
    }

    const typeVal = typeFilter.value;
    if (typeVal && typeVal !== 'all') {
      list = list.filter(v => v.type === typeVal);
    }

    const seatsVal = seatsFilter.value;
    if (seatsVal && seatsVal !== 'all') {
      const min = parseInt(seatsVal, 10);
      list = list.filter(v => v.seats >= min);
    }

    const acVal = acFilter.value;
    if (acVal === 'ac') list = list.filter(v => v.ac);
    if (acVal === 'nonac') list = list.filter(v => !v.ac);

    const priceVal = priceFilter.value;
    if (priceVal === 'low') list = list.filter(v => v.pricePerKm < 12);
    if (priceVal === 'mid') list = list.filter(v => v.pricePerKm >= 12 && v.pricePerKm <= 20);
    if (priceVal === 'high') list = list.filter(v => v.pricePerKm > 20);

    const sortVal = sortSelect.value;
    if (sortVal === 'price-asc') list.sort((a, b) => a.pricePerKm - b.pricePerKm);
    else if (sortVal === 'price-desc') list.sort((a, b) => b.pricePerKm - a.pricePerKm);
    else if (sortVal === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortVal === 'alpha') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }

  function render() {
    const list = getFilteredSortedVehicles();
    resultsCount.innerHTML = `Showing <strong>${list.length}</strong> of <strong>${SwiftStorage.VEHICLES.length}</strong> vehicles`;

    if (list.length === 0) {
      fleetGrid.innerHTML = `
        <div class="fleet-empty">
          <i class="ph ph-magnifying-glass"></i>
          <p>No vehicles match your search/filters. Try adjusting them.</p>
        </div>`;
      return;
    }

    fleetGrid.innerHTML = list.map(vehicleCardHTML).join('');

    fleetGrid.querySelectorAll('.book-now-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        SwiftStorage.saveSelectedVehicle(btn.dataset.type);
        showToast('Vehicle Selected', `${btn.dataset.type} added to your booking. Redirecting…`);
        setTimeout(() => { window.location.href = 'booking.html'; }, 700);
      });
    });

    if (window.observeReveal) {
      fleetGrid.querySelectorAll('.vehicle-card').forEach((el, i) => {
        el.setAttribute('data-reveal', '');
        el.style.transitionDelay = `${Math.min(i, 8) * 60}ms`;
      });
      window.observeReveal();
    }
  }

  const debouncedRender = window.debounce ? window.debounce(render, 200) : render;
  [searchInput, typeFilter, seatsFilter, acFilter, priceFilter, sortSelect].forEach(el => {
    if (!el) return;
    if (el === searchInput) {
      el.addEventListener('input', debouncedRender);
    } else {
      el.addEventListener('change', render);
    }
  });

  const resetBtn = document.getElementById('fleetResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      typeFilter.value = 'all';
      seatsFilter.value = 'all';
      acFilter.value = 'all';
      priceFilter.value = 'all';
      sortSelect.value = 'default';
      render();
    });
  }

  render();
}
