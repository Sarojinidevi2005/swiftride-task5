/* ============================================================
   SwiftRide — drivers.js
   "Meet Our Drivers" live data section (preserved from the
   original Task-3 project). Uses the free Random User API to
   fetch real profile photos + names, styled as driver cards.
   ============================================================ */

const driversGrid = document.getElementById('driversGrid');
const driversError = document.getElementById('driversError');
const refreshDriversBtn = document.getElementById('refreshDrivers');

if (driversGrid) {
  const DRIVERS_API_URL = 'https://randomuser.me/api/?results=4&nat=in,gb,us';
  const taxiTypes = ['Sedan', 'SUV', 'Mini', 'Sedan'];

  function showDriversLoading() {
    driversError.classList.remove('show');
    driversGrid.style.display = 'grid';
    driversGrid.innerHTML = Array.from({ length: 4 }).map(() => `
      <div class="driver-card skeleton">
        <div class="skel-avatar"></div>
        <div class="skel-line w60"></div>
        <div class="skel-line w40"></div>
      </div>
    `).join('');
  }

  function createDriverCardHTML(person, index) {
    const name = `${person.name.first} ${person.name.last}`;
    const location = `${person.location.city}, ${person.location.country}`;
    const rating = (4.5 + Math.random() * 0.5).toFixed(1);
    const years = Math.floor(Math.random() * 8) + 1;
    const taxiType = taxiTypes[index % taxiTypes.length];

    return `
      <div class="driver-card" data-reveal>
        <img class="driver-avatar" src="${person.picture.large}" alt="Photo of driver ${name}" loading="lazy" />
        <h4 class="driver-name">${name}</h4>
        <span class="driver-loc"><i class="ph ph-map-pin"></i> ${location}</span>
        <div class="driver-meta">
          <span><i class="ph-fill ph-star"></i> ${rating}</span>
          <span><i class="ph ph-car"></i> ${taxiType}</span>
          <span><i class="ph ph-calendar"></i> ${years} yrs</span>
        </div>
      </div>
    `;
  }

  async function loadDrivers() {
    showDriversLoading();

    // Abort the request if the network is slow/hanging, so the skeleton
    // loader never gets stuck indefinitely (Task-5 error handling).
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(DRIVERS_API_URL, { signal: controller.signal });
      if (!response.ok) throw new Error(`API responded with status ${response.status}`);

      const data = await response.json();
      const people = Array.isArray(data.results) ? data.results : [];
      if (people.length === 0) throw new Error('No driver data returned');

      driversGrid.innerHTML = people.map(createDriverCardHTML).join('');
      driversError.classList.remove('show');

      driversGrid.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    } catch (err) {
      const reason = err.name === 'AbortError' ? 'Request timed out' : err.message;
      console.error('Failed to load drivers:', reason);
      driversGrid.style.display = 'none';
      driversError.classList.add('show');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  loadDrivers();

  if (refreshDriversBtn) {
    refreshDriversBtn.addEventListener('click', loadDrivers);
  }
}
