// -------------------------------------------------------------------------------
// MODAL FUNCTIONS: Handle opening, closing, and saving events via modal
// -------------------------------------------------------------------------------

// Track selected difficulty and priority
let selectedDifficulty = null;
let selectedPriority = null;

/**
 * Opens the event modal for adding a new event
 */
function openEventModal() {
  const modal = document.getElementById('event-modal');
  const titleInput = document.getElementById('event-title');
  const commentsInput = document.getElementById('event-comments');
  
  // Clear the form fields
  titleInput.value = '';
  commentsInput.value = '';
  //Event Time Values — reset slider to full range
  if (typeof updateTimeSlider === 'function') updateTimeSlider();
  selectedDifficulty = null;
  selectedPriority = null;
  
  // Reset dropdown displays
  document.getElementById('difficulty-value').textContent = 'Select...';
  document.getElementById('priority-value').textContent = 'Select...';
  
  // Remove selected styling from dropdown items
  document.querySelectorAll('.dropdown-item.selected').forEach(item => {
    item.classList.remove('selected');
  });
  
  // Prevent opening if already open
  if (modal.classList.contains('active')) return;

  // Show the modal
  modal.classList.add('active');
  
  // Focus on the title input
  titleInput.focus();
}

/**
 * Closes the event modal without saving
 */
function closeEventModal() {
  const modal = document.getElementById('event-modal');
  modal.classList.remove('active');
  
  // Clear the form
  document.getElementById('event-form').reset();
  
  // Close all open dropdowns
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.remove('active');
  });
  document.querySelectorAll('.dropdown-button').forEach(btn => {
    btn.classList.remove('active');
  });
}

/**
 * Saves the event from the modal form
 */
function saveEventFromModal() {
  const titleInput = document.getElementById('event-title');
  const commentsInput = document.getElementById('event-comments');
  
  const title = titleInput.value.trim();
  const comments = commentsInput.value.trim();
  //Event Time Values (stored as minutes 0-1439, convert to HH:MM)
  const minsToStr = m => {
    const mins = parseInt(m) || 0;
    return String(Math.floor(mins/60)).padStart(2,'0') + ':' + String(mins%60).padStart(2,'0');
  };
  const timeStart = minsToStr(document.getElementById('event-time-start').value);
  const timeEnd   = minsToStr(document.getElementById('event-time-end').value);
  
  // Validate: at least a title is required
  if (!title || !selectedDate) return;

  // Prevent double submission
  if (saveEventFromModal._saving) return;
  saveEventFromModal._saving = true;
  setTimeout(() => { saveEventFromModal._saving = false; }, 500);

  // Create the event array for this date if it doesn't exist
  if (!events[selectedDate.key]) events[selectedDate.key] = [];
  
  // Create event object with title, comments, difficulty, and priority
const eventObj = {
    title: title,
    comments: comments,
    difficulty: selectedDifficulty,
    priority: selectedPriority,
    timeStart: timeStart,
    timeEnd: timeEnd
};

// Add the event to the array — prevent duplicates
  const existing = events[selectedDate.key];
  const isDuplicate = existing.some(e => e.title === eventObj.title && e.timeStart === eventObj.timeStart);
  if (isDuplicate) return;
  existing.push(eventObj);
  
  // Close the modal
  closeEventModal();
  
  // Re-render the calendar to show the new event
  render();

}

// -------------------------------------------------------------------------------
// MODAL EVENT LISTENERS: Set up modal interactions
// -------------------------------------------------------------------------------

// Modal form submission
// When user submits the form (clicks Save or presses Enter)
document.getElementById('event-form').addEventListener('submit', (e) => {
  e.preventDefault();
  saveEventFromModal();
});

// Modal cancel button
// When clicked, close the modal without saving
document.getElementById('modal-cancel').addEventListener('click', closeEventModal);

// Close modal when clicking outside the modal box
document.getElementById('event-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('event-modal')) {
    closeEventModal();
  }
});

// -------------------------------------------------------------------------------
// DROPDOWN EVENT LISTENERS: Handle difficulty and priority dropdowns
// -------------------------------------------------------------------------------

// Difficulty dropdown button
document.getElementById('difficulty-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const menu = document.getElementById('difficulty-menu');
  const btn = document.getElementById('difficulty-btn');
  
  // Close priority dropdown if open
  document.getElementById('priority-menu').classList.remove('active');
  document.getElementById('priority-btn').classList.remove('active');
  
  // Toggle this dropdown
  menu.classList.toggle('active');
  btn.classList.toggle('active');
});

// Priority dropdown button
document.getElementById('priority-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const menu = document.getElementById('priority-menu');
  const btn = document.getElementById('priority-btn');
  
  // Close difficulty dropdown if open
  document.getElementById('difficulty-menu').classList.remove('active');
  document.getElementById('difficulty-btn').classList.remove('active');
  
  // Toggle this dropdown
  menu.classList.toggle('active');
  btn.classList.toggle('active');
});

// Difficulty menu items
document.querySelectorAll('#difficulty-menu .dropdown-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove selected class from all items
    document.querySelectorAll('#difficulty-menu .dropdown-item').forEach(i => {
      i.classList.remove('selected');
    });
    
    // Add selected class to clicked item
    item.classList.add('selected');
    
    // Update the button display text
    selectedDifficulty = item.dataset.value;
    document.getElementById('difficulty-value').textContent = item.textContent;
    
    // Close the dropdown
    document.getElementById('difficulty-menu').classList.remove('active');
    document.getElementById('difficulty-btn').classList.remove('active');
  });
});

// Priority menu items
document.querySelectorAll('#priority-menu .dropdown-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove selected class from all items
    document.querySelectorAll('#priority-menu .dropdown-item').forEach(i => {
      i.classList.remove('selected');
    });
    
    // Add selected class to clicked item
    item.classList.add('selected');
    
    // Update the button display text
    selectedPriority = item.dataset.value;
    document.getElementById('priority-value').textContent = item.textContent;
    
    // Close the dropdown
    document.getElementById('priority-menu').classList.remove('active');
    document.getElementById('priority-btn').classList.remove('active');
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown-group')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.classList.remove('active');
    });
    document.querySelectorAll('.dropdown-button').forEach(btn => {
      btn.classList.remove('active');
    });
  }
});
