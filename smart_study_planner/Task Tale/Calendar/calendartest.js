// -------------------------------------------------------------------------------
// const: Define the data that doesn't change
// -------------------------------------------------------------------------------

// Array of all month names used to display the current month
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// Array of colors used to color-code different events in the calendar
const EVENT_COLORS = [
  '#185FA5','#D4537E','#1D9E75','#BA7517',
  '#7F77DD','#D85A30','#0F6E56','#993556'
];


// -------------------------------------------------------------------------------
// STATE variables: Keeps track of what the user is viewing and what events exist
// -------------------------------------------------------------------------------

// Store the current date (today)
let now = new Date();

// Store the year currently being displayed on screen
let viewYear = now.getFullYear();

// Store the month currently being displayed on screen (0 = January, 11 = December)
let viewMonth = now.getMonth();

// Store the currently selected date (null if no date is selected)
let selectedDate = null;

// Object that stores all events: key is date (YYYY-MM-DD), value is array of event strings
// Example: { "2026-04-15": ["Meeting", "Exam"], "2026-04-16": ["Doctor"] }
let events = {};

// Stores the Sunday that starts the currently-visible week in weekly view
let weekStartDate = (() => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - d.getDay()); // go back to Sunday
  return d;
})();

// -------------------------------------------------------------------------------
// UTILITY function: Convert date numbers into a string key
// -------------------------------------------------------------------------------

/**
 * Creates a date key string in format: YYYY-MM-DD (e.g., "2026-04-15")
 * Used as a key to store and retrieve events from the events object
 *
 * @param {number} y - Year (e.g., 2026)
 * @param {number} m - Month (0-11, where 0 is January)
 * @param {number} d - Day (1-31)
 * @returns {string} - Formatted date string like "2026-04-15"
 */
function dateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// -------------------------------------------------------------------------------
// RENDER function: Draws the calendar grid on the screen
// -------------------------------------------------------------------------------

/**
 * Main rendering function that rebuilds the entire calendar display.
 * Called whenever the month changes or a day is selected.
 */
function render() {
  // Step 1: Update the month/year label at the top (only in monthly view)
  if (typeof currentView === 'undefined' || currentView !== 'weekly') {
    document.getElementById('month-label').textContent = `${MONTHS[viewMonth]} ${viewYear}`;
  }

  // Step 2: Clear out old day cells from the grid
  const grid = document.getElementById('cal-grid');
  grid.querySelectorAll('.day-cell').forEach(c => c.remove());

  // Step 3: Calculate calendar layout numbers
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();       // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();



// Step 4: Add filler cells from the previous month
  for (let i = 0; i < firstDay; i++) {
    const prevDay = daysInPrev - firstDay + 1 + i;
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevKey = dateKey(prevYear, prevMonth, prevDay);

    const cell = document.createElement('div');
    cell.className = 'day-cell other-month';
    cell.style.cssText = `
        height: 70px;
        min-height: 70px;
        max-height: 70px;
        overflow: hidden;
        position: relative;
        padding: 4px;
        box-sizing: border-box;
    `;

    const dateNum = document.createElement('div');
    dateNum.textContent = prevDay;
    dateNum.style.cssText = `
        font-weight: 600;
        position: absolute;
        top: 4px;
        left: 0;
        width: 100%;
        text-align: center;
        z-index: 2;
    `;
    cell.appendChild(dateNum);

    let clickTimer = null;
    cell.addEventListener('click', () => {
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            selectedDate = { y: viewYear, m: viewMonth, d, key };
            render();
        }, 200);
    });

    cell.addEventListener('dblclick', () => {
        clearTimeout(clickTimer);
        selectDay(viewYear, viewMonth, d, key);
    });
    grid.appendChild(cell);
  }



  // Step 5: Add all the days of the current month
for (let d = 1; d <= daysInMonth; d++) {
    const cell = document.createElement('div');
    const key = dateKey(viewYear, viewMonth, d);

    const isToday = (
      d === now.getDate() &&
      viewMonth === now.getMonth() &&
      viewYear === now.getFullYear()
    );

    let cls = 'day-cell';
    if (isToday) cls += ' today';
    if (selectedDate && selectedDate.key === key) cls += ' selected';
    if (events[key] && events[key].length > 0) cls += ' has-event';

    cell.className = cls;
    cell.style.cssText = '';
    cell.style.cssText = `
        height: 70px;
        min-height: 70px;
        max-height: 70px;
        overflow: hidden;
        position: relative;
        padding: 4px;
        box-sizing: border-box;
    `;
    const dateNum = document.createElement('div');
    dateNum.textContent = d;
    dateNum.style.cssText = `
        font-weight: 600;
        position: absolute;
        top: 4px;
        left: 0;
        width: 100%;
        text-align: center;
        z-index: 2;
    `;
    cell.appendChild(dateNum);

    const tagsWrapper = document.createElement('div');
    tagsWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 1px;
        width: 100%;
        overflow: hidden;
        position: absolute;
        top: 22px;
        left: 0;
        right: 0;
        padding: 0 4px;
        box-sizing: border-box;
    `;
    cell.appendChild(tagsWrapper);


    const cellEvents = events[key] || [];
    cellEvents.slice(0, 3).forEach((ev, i) => {
        const tag = document.createElement('div');
        tag.style.cssText = `
          background: ${EVENT_COLORS[i % EVENT_COLORS.length]};
          color: white;
          font-size: 9px;
          border-radius: 3px;
          padding: 1px 3px;
          margin-top: 1px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          width: 100%;
          box-sizing: border-box;
          display: block;
          line-height: 1.2;
      `;
          tag.textContent = ev.title || ev;
        tagsWrapper.appendChild(tag);
    });

    cell.addEventListener('click', () => {
        selectedDate = { y: viewYear, m: viewMonth, d, key };
        render();
    });

    cell.addEventListener('dblclick', () => selectDay(viewYear, viewMonth, d, key));
    grid.appendChild(cell);
  }






// Step 6: Add filler cells from the next month
  const total = firstDay + daysInMonth;
  const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  for (let d = 1; d <= remaining; d++) {
    const nextKey = dateKey(nextYear, nextMonth, d);

    const cell = document.createElement('div');
    cell.className = 'day-cell other-month';
    cell.style.cssText = `
        height: 70px;
        min-height: 70px;
        max-height: 70px;
        overflow: hidden;
        position: relative;
        padding: 4px;
        box-sizing: border-box;
    `;

    const dateNum = document.createElement('div');
    dateNum.textContent = d;
    dateNum.style.cssText = `
        font-weight: 600;
        position: absolute;
        top: 4px;
        left: 0;
        width: 100%;
        text-align: center;
        z-index: 2;
    `;
    cell.appendChild(dateNum);

    cell.addEventListener('click', () => {
        viewYear = nextYear;
        viewMonth = nextMonth;
        selectedDate = { y: nextYear, m: nextMonth, d, key: nextKey };
        render();
    });
    cell.addEventListener('dblclick', () => selectDay(nextYear, nextMonth, d, nextKey));
    grid.appendChild(cell);
  }





// Step 7: Update the events panel to show events for the selected date
  renderEvents();

  if (typeof currentView !== 'undefined' && currentView === 'weekly') renderWeekly();
}
// -------------------------------------------------------------------------------
// SELECT A DAY function: Called when the user clicks on a date
// -------------------------------------------------------------------------------

/**
 * Stores which day was selected, re-renders the calendar, shows the event input,
 * and updates the schedule sidebar.
 *
 * @param {number} y   - Year of selected date
 * @param {number} m   - Month of selected date (0-11)
 * @param {number} d   - Day of selected date (1-31)
 * @param {string} key - Formatted date key (YYYY-MM-DD)
 */
function selectDay(y, m, d, key) {
  selectedDate = { y, m, d, key };
  render();
  
  // Opens modal to add event
  openEventModal();
}

// -------------------------------------------------------------------------------
// RENDER EVENTS function: Shows events for the selected date in the right panel
// -------------------------------------------------------------------------------

/**
 * Updates the right panel to show:
 * - The name of the selected date (e.g., "Wednesday, April 15")
 * - A list of all events for that date
 * - A message if there are no events
 */
function renderEvents() {
  const label = document.getElementById('event-date-label');
  const list = document.getElementById('event-list');
  list.innerHTML = '';

  // Step 1: No date selected — show prompt
  if (!selectedDate) {
    label.textContent = 'Select a day';
    return;
  }

  // Step 2: Format and display the selected date
  const date = new Date(selectedDate.y, selectedDate.m, selectedDate.d);
  label.textContent = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  // Step 3: Get events for this date
  const evts = events[selectedDate.key] || [];

  // Step 4: No events — show placeholder message
  if (evts.length === 0) {
    const el = document.createElement('div');
    el.className = 'event-empty';
    el.textContent = 'No events — feel free to add one below';
    list.appendChild(el);
  }

  
 // Step 5: Otherwise, create HTML for each event 

 else {
    evts.forEach((ev, i) => {
      // Create the main event item container
      const el = document.createElement('div');
      el.className = 'event-item';
 
      // Create the colored dot (different color for each event)
      const dot = document.createElement('div');
      dot.className = 'event-dot';
      dot.style.background = EVENT_COLORS[i % EVENT_COLORS.length];
 
      // Creates the event text (title, comments, difficulty, and priority)
      const textContainer = document.createElement('div');
      textContainer.style.flex = '1';
      textContainer.style.display = 'flex';
      textContainer.style.flexDirection = 'column';
      textContainer.style.gap = '4px';
      
      const titleSpan = document.createElement('span');
      const eventTitle = ev.title || 'Untitled';
      const eventComments = ev.comments ? ` - ${ev.comments}` : '';
      titleSpan.textContent = eventTitle + eventComments;
      titleSpan.style.fontWeight = '500';
      textContainer.appendChild(titleSpan);
      
      // Add difficulty and priority tags if they exist and stacking them vertically 
  if (ev.difficulty || ev.priority) {
  const tagsContainer = document.createElement('div');
  tagsContainer.style.display = 'flex';
  tagsContainer.style.flexDirection = 'column';
  tagsContainer.style.gap = '2px';
  tagsContainer.style.fontSize = '12px';
  tagsContainer.style.color = '#666';

  if (ev.difficulty) {
    const diffSpan = document.createElement('span');
    diffSpan.textContent = `Diff: ${ev.difficulty.charAt(0).toUpperCase() + ev.difficulty.slice(1)}`;
    tagsContainer.appendChild(diffSpan);
  }
  if (ev.priority) {
    const prioSpan = document.createElement('span');
    prioSpan.textContent = `Prio: ${ev.priority.charAt(0).toUpperCase() + ev.priority.slice(1)}`;
    tagsContainer.appendChild(prioSpan);
  }

  textContainer.appendChild(tagsContainer);
}
 
      // Creates the delete button (×)
      const del = document.createElement('button');
      del.textContent = '×';
      del.title = 'Delete event';
      del.addEventListener('click', () => {
        // Remove this event from the array
        events[selectedDate.key].splice(i, 1);
        // Re-render to update the displayed calendar
        render();
      });
      el.appendChild(dot);
      el.appendChild(textContainer);
      el.appendChild(del);
      list.appendChild(el);
    });
  }
  
  // Update the Daily Schedule sidebar to match selected date
  if (typeof renderTimeline === 'function') renderTimeline();
}

// -------------------------------------------------------------------------------
// EVENT LISTENERS: This part is important because it connects buttons and inputs to their functions
// -------------------------------------------------------------------------------

// "Previous Month/Week" button
document.getElementById('prev').addEventListener('click', () => {
  if (typeof currentView !== 'undefined' && currentView === 'weekly') {
    weekStartDate.setDate(weekStartDate.getDate() - 7);
    renderWeekly();
  } else {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  }
});

// "Next Month/Week" button
document.getElementById('next').addEventListener('click', () => {
  if (typeof currentView !== 'undefined' && currentView === 'weekly') {
    weekStartDate.setDate(weekStartDate.getDate() + 7);
    renderWeekly();
  } else {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  }
});

// "Today" button
document.getElementById('today-btn').addEventListener('click', () => {
  viewYear = now.getFullYear();
  viewMonth = now.getMonth();
  // Also reset week view to current week
  weekStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
  if (typeof currentView !== 'undefined' && currentView === 'weekly') {
    renderWeekly();
  } else {
    render();
  }
});

// Call render() once to display the calendar for the current month
render();

// -------------------------------------------------------------------------------
// SCHEDULE SIDEBAR function: Displays daily tasks for the selected date
// -------------------------------------------------------------------------------

/**
 * Updates the schedule sidebar to show tasks for the selected date.
 * Called whenever a date is selected on the calendar.
 */
function updateScheduleSidebar() {
  const scheduleDate = document.getElementById('schedule-date');
  const scheduleList = document.getElementById('schedule-list');

  // Step 1: No date selected — show prompt
  if (!selectedDate) {
    scheduleDate.textContent = 'Select a date';
    scheduleList.innerHTML = '<div class="schedule-empty">No date selected</div>';
    return;
  }

  // Step 2: Format the selected date nicely (e.g., "Mon, Apr 15")
  const dateObj = new Date(selectedDate.y, selectedDate.m, selectedDate.d);
  scheduleDate.textContent = dateObj.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  // Step 3: Get tasks for this date
  const tasks = events[selectedDate.key] || [];

  // Step 4: No tasks — show placeholder
  if (tasks.length === 0) {
    scheduleList.innerHTML = '<div class="schedule-empty">No tasks scheduled</div>';
    return;
  }

  // Step 5: Build an element for each task
  scheduleList.innerHTML = tasks.map((task, i) => {
    const color = EVENT_COLORS[i % EVENT_COLORS.length];
    const title = task.title || 'Untitled';
    const diff = task.difficulty ? `<span style="font-size:11px;color:#999;">Diff: ${task.difficulty.charAt(0).toUpperCase()+task.difficulty.slice(1)}</span>` : '';
    const prio = task.priority ? `<span style="font-size:11px;color:#999;">Prio: ${task.priority.charAt(0).toUpperCase()+task.priority.slice(1)}</span>` : '';
    const comments = task.comments ? `<span style="font-size:12px;color:#666;">${task.comments}</span>` : '';
    
      const timeLabel = task.timeStart
        ? `<div class="schedule-time">${task.timeStart}${task.timeEnd ? ' – ' + task.timeEnd : ''}</div>`
        : '';
      return `
        <div class="schedule-item" style="border-left-color:${color};">
            ${timeLabel}
            <div class="schedule-task">${title}</div>
            ${comments}
            <div style="display:flex;gap:8px;margin-top:4px;">${diff}${prio}</div>
        </div>
      `;
  }).join('');
}

// "Add" button
document.getElementById('add-btn').addEventListener('click', addEvent);

// "Enter" key in event input
document.getElementById('event-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addEvent();
});
