/* ============================================================
   SwiftRide — pricing.js
   Powers the estimated fare calculator on the Pricing page.
   Inputs: Pickup, Drop, Vehicle Type. Output: Distance,
   Base Fare, Total Fare.
   ============================================================ */

const calcForm = document.getElementById('calcForm');

if (calcForm) {
  const calcVehicleSelect = document.getElementById('calcVehicle');

  function populateCalcVehicles() {
    const types = [...new Set(SwiftStorage.VEHICLES.map(v => v.type))];
    calcVehicleSelect.innerHTML = types.map(type => {
      const sample = SwiftStorage.VEHICLES.find(v => v.type === type);
      return `<option value="${type}">${type} — ₹${sample.pricePerKm}/km</option>`;
    }).join('');
  }
  populateCalcVehicles();

  calcForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const pickup = document.getElementById('calcPickup').value.trim();
    const drop = document.getElementById('calcDrop').value.trim();
    const vehicleType = calcVehicleSelect.value;

    if (!pickup || !drop) {
      showToast('Missing details', 'Please enter both pickup and drop locations.', 'error');
      return;
    }

    const fareInfo = SwiftStorage.calculateFare(pickup, drop, vehicleType);
    const resultBox = document.getElementById('calcResult');

    document.getElementById('calcDistanceOut').textContent = `${fareInfo.distance} km`;
    document.getElementById('calcBaseOut').textContent = `₹${fareInfo.baseFare}`;
    document.getElementById('calcDistanceChargeOut').textContent = `₹${fareInfo.perKmCharge}`;
    document.getElementById('calcTotalOut').textContent = `₹${fareInfo.total}`;

    resultBox.classList.add('show');
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
