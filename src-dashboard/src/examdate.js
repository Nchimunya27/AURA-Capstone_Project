// Exam Date Picker for My Courses Page

// Initialize the calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    const examDateInput = document.getElementById('examDate');
    const calendarButton = document.querySelector('.calendar-button');
    
    if (examDateInput && calendarButton) {
      // Open calendar when clicking on calendar button
      calendarButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openDatePicker();
      });
      
      // Open calendar when clicking on date input
      examDateInput.addEventListener('click', function() {
        openDatePicker();
      });
    }
  });
  
  // Function to open the date picker
  function openDatePicker() {
    // Get reference to the exam date input
    const examDateInput = document.getElementById('examDate');
    
    // Create the calendar modal
    const modal = document.createElement('div');
    modal.id = 'datepicker-modal';
    modal.className = 'datepicker-modal';
    
   
    if (!document.getElementById('datepicker-styles')) {
      const styles = document.createElement('style');
      styles.id = 'datepicker-styles';
      styles.textContent = `
        .datepicker-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .datepicker-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          width: 320px;
          overflow: hidden;
        }
        
        .datepicker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: var(--primary-color, #4A6DA7);
          color: white;
        }
        
        .datepicker-title {
          font-weight: bold;
          font-size: 18px;
        }
        
        .datepicker-month-nav {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .month-nav-btn {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .month-nav-btn:hover {
          background-color: rgba(255,255,255,0.2);
        }
        
        .datepicker-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        
        .datepicker-weekday {
          font-weight: 500;
          color: #666;
        }
        
        .datepicker-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          padding: 10px;
        }
        
        .datepicker-day {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 36px;
          width: 36px;
          border-radius: 50%;
          cursor: pointer;
        }
        
        .datepicker-day:hover {
          background-color: #f0f0f0;
        }
        
        .datepicker-day.current-month {
          color: #333;
        }
        
        .datepicker-day.other-month {
          color: #ccc;
        }
        
        .datepicker-day.today {
          border: 2px solid var(--accent-color, #6E9EEB);
        }
        
        .datepicker-day.selected {
          background-color: var(--accent-color, #6E9EEB);
          color: white;
        }
        
        .datepicker-footer {
          display: flex;
          justify-content: space-between;
          padding: 15px;
          border-top: 1px solid #eee;
        }
        
        .datepicker-footer button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        
        .datepicker-today {
          background-color: #f0f0f0;
        }
        
        .datepicker-close {
          background-color: var(--accent-color, #6E9EEB);
          color: white;
        }
      `;
      document.head.appendChild(styles);
    }
    
    // Get current date values
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    
    // Parse existing date if one is set
    let selectedDate = null;
    if (examDateInput.value) {
      const parts = examDateInput.value.split('/');
      if (parts.length === 3) {
        selectedDate = new Date(parts[2], parts[0] - 1, parts[1]);
        currentMonth = selectedDate.getMonth();
        currentYear = selectedDate.getFullYear();
      }
    }
    
    // Create calendar structure
    modal.innerHTML = `
      <div class="datepicker-container">
        <div class="datepicker-header">
          <div class="datepicker-title">Select Date</div>
          <div class="datepicker-month-nav">
            <button class="month-nav-btn prev-month">&lsaquo;</button>
            <span class="current-month-display"></span>
            <button class="month-nav-btn next-month">&rsaquo;</button>
          </div>
        </div>
        <div class="datepicker-weekdays">
          <div class="datepicker-weekday">Su</div>
          <div class="datepicker-weekday">Mo</div>
          <div class="datepicker-weekday">Tu</div>
          <div class="datepicker-weekday">We</div>
          <div class="datepicker-weekday">Th</div>
          <div class="datepicker-weekday">Fr</div>
          <div class="datepicker-weekday">Sa</div>
        </div>
        <div class="datepicker-days"></div>
        <div class="datepicker-footer">
          <button class="datepicker-today">Today</button>
          <button class="datepicker-close">Close</button>
        </div>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(modal);
    
    // Function to render the calendar
    function renderCalendar(month, year) {
      const monthDisplay = modal.querySelector('.current-month-display');
      const daysContainer = modal.querySelector('.datepicker-days');
      
      // Update month display
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
      monthDisplay.textContent = `${monthNames[month]} ${year}`;
      
      // Clear previous days
      daysContainer.innerHTML = '';
      
      // Get first day of month and total days
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Previous month days
      const prevMonthDays = new Date(year, month, 0).getDate();
      for (let i = firstDay - 1; i >= 0; i--) {
        const dayElem = document.createElement('div');
        dayElem.className = 'datepicker-day other-month';
        dayElem.textContent = prevMonthDays - i;
        daysContainer.appendChild(dayElem);
      }
      
      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const dayElem = document.createElement('div');
        dayElem.className = 'datepicker-day current-month';
        dayElem.textContent = i;
        
        // Check if it's today
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
          dayElem.classList.add('today');
        }
        
        // Check if it's the selected date
        if (selectedDate && 
            year === selectedDate.getFullYear() && 
            month === selectedDate.getMonth() && 
            i === selectedDate.getDate()) {
          dayElem.classList.add('selected');
        }
        
        // Add click event to select date
        dayElem.addEventListener('click', function() {
          // Update the input value with selected date in MM/DD/YYYY format
          const formattedMonth = (month + 1).toString().padStart(2, '0');
          const formattedDay = i.toString().padStart(2, '0');
          examDateInput.value = `${formattedMonth}/${formattedDay}/${year}`;
          
          // Close the date picker
          document.body.removeChild(modal);
        });
        
        daysContainer.appendChild(dayElem);
      }
      
      // Next month days to fill remaining grid
      const totalCells = 42; 
      const cellsFilled = firstDay + daysInMonth;
      for (let i = 1; i <= totalCells - cellsFilled; i++) {
        const dayElem = document.createElement('div');
        dayElem.className = 'datepicker-day other-month';
        dayElem.textContent = i;
        daysContainer.appendChild(dayElem);
      }
    }
    
    // Render initial calendar
    renderCalendar(currentMonth, currentYear);
    
    // Set up navigation buttons
    const prevBtn = modal.querySelector('.prev-month');
    const nextBtn = modal.querySelector('.next-month');
    
    prevBtn.addEventListener('click', function() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar(currentMonth, currentYear);
    });
    
    nextBtn.addEventListener('click', function() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar(currentMonth, currentYear);
    });
    
    // Set up today and close buttons
    const todayBtn = modal.querySelector('.datepicker-today');
    const closeBtn = modal.querySelector('.datepicker-close');
    
    todayBtn.addEventListener('click', function() {
      const todayDate = new Date();
      const formattedMonth = (todayDate.getMonth() + 1).toString().padStart(2, '0');
      const formattedDay = todayDate.getDate().toString().padStart(2, '0');
      examDateInput.value = `${formattedMonth}/${formattedDay}/${todayDate.getFullYear()}`;
      document.body.removeChild(modal);
    });
    
    closeBtn.addEventListener('click', function() {
      document.body.removeChild(modal);
    });
    
    // Close when clicking outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }