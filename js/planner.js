/* ============================================================
   SwiftRide — planner.js
   Home page "Ride Planner" widget (preserved from the original
   project): add / complete / delete planned ride tasks, with
   live counters. Now persisted via the shared SwiftStorage layer.
   ============================================================ */

const plannerForm = document.getElementById('plannerForm');
const rideTaskInput = document.getElementById('rideTaskInput');
const rideTaskList = document.getElementById('rideTaskList');
const plannerEmpty = document.getElementById('plannerEmpty');
const plannerErr = document.getElementById('plannerErr');
const totalRideCount = document.getElementById('totalRideCount');
const pendingRideCount = document.getElementById('pendingRideCount');
const completedRideCount = document.getElementById('completedRideCount');

if (plannerForm) {
  let rideTasks = SwiftStorage.getRideTasks();

  function persist() {
    SwiftStorage.saveRideTasks(rideTasks);
  }

  function updateCounters() {
    const total = rideTasks.length;
    const completed = rideTasks.filter(t => t.completed).length;
    const pending = total - completed;
    totalRideCount.textContent = total;
    pendingRideCount.textContent = pending;
    completedRideCount.textContent = completed;
    plannerEmpty.classList.toggle('show', total === 0);
    rideTaskList.style.display = total === 0 ? 'none' : 'flex';
  }

  function createRideTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'planner-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;
    li.innerHTML = `
      <button type="button" class="planner-check" aria-label="Mark ride as complete">
        <i class="ph-fill ph-check"></i>
      </button>
      <span class="planner-text"></span>
      <button type="button" class="planner-delete" aria-label="Delete ride task">
        <i class="ph ph-trash"></i>
      </button>
    `;
    li.querySelector('.planner-text').textContent = task.text;
    return li;
  }

  function renderRideTasks() {
    rideTaskList.innerHTML = '';
    rideTasks.forEach(task => rideTaskList.appendChild(createRideTaskElement(task)));
    updateCounters();
  }

  function addRideTask(text) {
    const trimmed = text.trim();
    if (trimmed === '') {
      plannerErr.classList.add('show');
      rideTaskInput.classList.add('error');
      return false;
    }
    plannerErr.classList.remove('show');
    rideTaskInput.classList.remove('error');

    rideTasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: trimmed,
      completed: false,
    });
    persist();
    renderRideTasks();
    return true;
  }

  plannerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const added = addRideTask(rideTaskInput.value);
    if (added) {
      rideTaskInput.value = '';
      rideTaskInput.focus();
    }
  });

  rideTaskInput.addEventListener('input', () => {
    if (rideTaskInput.value.trim() !== '') {
      plannerErr.classList.remove('show');
      rideTaskInput.classList.remove('error');
    }
  });

  rideTaskList.addEventListener('click', function (e) {
    const item = e.target.closest('.planner-item');
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.closest('.planner-check')) {
      const task = rideTasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        persist();
        renderRideTasks();
      }
    } else if (e.target.closest('.planner-delete')) {
      rideTasks = rideTasks.filter(t => t.id !== id);
      persist();
      renderRideTasks();
    }
  });

  renderRideTasks();
}
