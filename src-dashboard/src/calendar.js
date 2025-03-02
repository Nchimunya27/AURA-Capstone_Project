/**
 * AURA Learning Dashboard - Schedule Module
 * Complete implementation for the calendar, exam management, and course tracking
 */

document.addEventListener('DOMContentLoaded', function() {
    // ===== Calendar Elements =====
    const calendarDaysContainer = document.querySelector('.calendar-days');
    const currentMonthElement = document.querySelector('.current-month');
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');
    const courseListContainer = document.querySelector('.course-list');
    const calendarEmptyState = document.querySelector('.calendar-empty-state');
    const courseEmptyState = document.querySelector('.course-empty-state');
  
    // ===== Current Date Tracking =====
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedCourse = null; // Track selected course for filtering
  
    // ===== Sample Exam Data =====
    // Initial data - in production, this would come from an API or database
    let examEvents = [
      {
        id: 1,
        title: 'Mathematics Mid-term',
        course: 'Mathematics',
        date: new Date(2025, 2, 6), // March 6, 2025
        time: '9:00 AM',
        location: 'Room 101',
        notes: 'Covers chapters 1-5',
        type: 'math-exam'
      },
      {
        id: 2,
        title: 'Physics Lab Test',
        course: 'Physics',
        date: new Date(2025, 2, 15), // March 15, 2025
        time: '2:00 PM',
        location: 'Lab B',
        notes: 'Bring calculator and lab notebook',
        type: 'physics-exam'
      },
      {
        id: 3,
        title: 'CS Programming Exam',
        course: 'Computer Science',
        date: new Date(2025, 2, 20), // March 20, 2025
        time: '10:30 AM',
        location: 'Computer Lab',
        notes: 'Focus on algorithms and data structures',
        type: 'cs-exam'
      },
      {
        id: 4,
        title: 'Mathematics Final',
        course: 'Mathematics',
        date: new Date(2025, 3, 10), // April 10, 2025
        time: '9:00 AM',
        location: 'Hall A',
        notes: 'Comprehensive exam covering all topics',
        type: 'math-exam'
      }
    ];
  
    // Initialize everything
    initializeCalendar();
    updateCourseList();
  
    // ===== CALENDAR FUNCTIONALITY =====
  
    /**
     * Initialize the calendar view and add event listeners
     */
    function initializeCalendar() {
      // Add event listeners for month navigation
      prevMonthButton.addEventListener('click', showPreviousMonth);
      nextMonthButton.addEventListener('click', showNextMonth);
      
      // Generate initial calendar
      generateCalendar(currentMonth, currentYear);
      
      // Add + button for adding exams
      addExamButton();
      
      // Create exam form modal if it doesn't exist
      createExamFormModal();
      
      // Create exam details modal event listeners
      initializeExamDetailsModal();
    }
  
    /**
     * Generate the calendar for a specific month and year
     * @param {number} month - Month index (0-11)
     * @param {number} year - Full year (e.g., 2025)
     */
    function generateCalendar(month, year) {
      // Clear existing calendar days
      calendarDaysContainer.innerHTML = '';
      
      // Hide empty state
      if (calendarEmptyState) {
        calendarEmptyState.classList.add('hidden');
      }
      
      // Update the month/year display
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
      currentMonthElement.textContent = `${monthNames[month]} ${year}`;
      
      // Get the first day of the month
      const firstDay = new Date(year, month, 1).getDay();
      
      // Get the number of days in the month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        appendDayElement('empty');
      }
      
      // Add cells for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        let events = getEventsForDate(date);
        
        // Filter events by selected course if one is selected
        if (selectedCourse) {
          events = events.filter(event => event.course === selectedCourse);
        }
        
        if (events.length > 0) {
          appendDayElement('has-exam', day, events);
        } else {
          appendDayElement('', day);
        }
      }
    }
  
    /**
     * Create and append a day element to the calendar
     * @param {string} className - Additional class for the day element
     * @param {number} dayNumber - Day of the month
     * @param {Array} events - Array of events for the day
     */
    function appendDayElement(className, dayNumber, events = []) {
      const dayElement = document.createElement('div');
      dayElement.className = `calendar-day ${className}`;
      
      if (dayNumber) {
        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);
        
        // Add exam events if they exist
        events.forEach(event => {
          const examElement = document.createElement('div');
          examElement.className = `exam-item ${event.type}`;
          examElement.innerHTML = `
            <div class="exam-title">${event.title}</div>
            <div class="exam-time">${event.time}</div>
          `;
          dayElement.appendChild(examElement);
          
          // Add click event to show details
          examElement.addEventListener('click', () => showExamDetails(event));
        });
        
        // Add today's styling if it's the current day
        const today = new Date();
        if (today.getDate() === dayNumber && 
            today.getMonth() === currentMonth && 
            today.getFullYear() === currentYear) {
          dayElement.classList.add('today');
        }
      }
      
      calendarDaysContainer.appendChild(dayElement);
    }
  
    /**
     * Show the previous month
     */
    function showPreviousMonth() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      generateCalendar(currentMonth, currentYear);
    }
  
    /**
     * Show the next month
     */
    function showNextMonth() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      generateCalendar(currentMonth, currentYear);
    }
  
    /**
     * Get events for a specific date
     * @param {Date} date - Date to check for events
     * @returns {Array} Array of events for the date
     */
    function getEventsForDate(date) {
      return examEvents.filter(event => 
        event.date.getDate() === date.getDate() && 
        event.date.getMonth() === date.getMonth() && 
        event.date.getFullYear() === date.getFullYear()
      );
    }
  
    /**
     * Add a button to add new exams
     */
    function addExamButton() {
      const calendarHeader = document.querySelector('.calendar-header');
      if (!calendarHeader || calendarHeader.querySelector('.add-exam-btn')) return;
      
      const addButton = document.createElement('button');
      addButton.className = 'btn-primary add-exam-btn';
      addButton.innerHTML = '<span class="plus-icon">+</span> Add Exam';
      addButton.addEventListener('click', () => openExamForm());
      
      calendarHeader.appendChild(addButton);
    }
  
    // ===== COURSE LIST FUNCTIONALITY =====
  
    /**
     * Generate the course list with exam counts
     */
    function updateCourseList() {
      if (!courseListContainer) return;
      
      // Clear existing list
      courseListContainer.innerHTML = '';
      
      // Get unique courses and count exams
      const courseMap = new Map();
      
      examEvents.forEach(event => {
        if (courseMap.has(event.course)) {
          courseMap.set(event.course, courseMap.get(event.course) + 1);
        } else {
          courseMap.set(event.course, 1);
        }
      });
      
      // Show empty state if no courses
      if (courseMap.size === 0) {
        if (courseEmptyState) {
          courseEmptyState.classList.remove('hidden');
          courseListContainer.appendChild(courseEmptyState);
        }
        return;
      }
      
      // Hide empty state
      if (courseEmptyState) {
        courseEmptyState.classList.add('hidden');
      }
      
      // Generate course items
      courseMap.forEach((count, course) => {
        const courseElement = document.createElement('div');
        courseElement.className = 'course-item';
        if (selectedCourse === course) {
          courseElement.classList.add('active');
        }
        
        // Determine subject class based on course name
        let subjectClass = '';
        if (course.toLowerCase().includes('math')) {
          subjectClass = 'subject-math';
        } else if (course.toLowerCase().includes('physics')) {
          subjectClass = 'subject-physics';
        } else if (course.toLowerCase().includes('computer') || course.toLowerCase().includes('cs')) {
          subjectClass = 'subject-cs';
        }
        
        courseElement.innerHTML = `
          <div class="course-name ${subjectClass}">${course}</div>
          <div class="exam-count">${count} Exam${count !== 1 ? 's' : ''}</div>
        `;
        
        // Add click event for course filtering
        courseElement.addEventListener('click', () => {
          if (selectedCourse === course) {
            // Deselect if already selected
            selectedCourse = null;
            document.querySelectorAll('.course-item').forEach(item => {
              item.classList.remove('active');
            });
          } else {
            // Select this course
            selectedCourse = course;
            document.querySelectorAll('.course-item').forEach(item => {
              item.classList.remove('active');
            });
            courseElement.classList.add('active');
          }
          
          // Regenerate calendar with filter
          generateCalendar(currentMonth, currentYear);
        });
        
        courseListContainer.appendChild(courseElement);
      });
    }
  
    // ===== EXAM FORM MODAL =====
  
/**
 * Updated Exam Modal Functionality
 * This code can be added to your schedule.js file or used to replace the existing modal functions
 */

/**
 * Create the exam form modal
 */
function createExamFormModal() {
    if (document.getElementById('examFormModal')) return;
    
    const modalHTML = `
      <div id="examFormModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="examFormTitle">Add New Exam</h2>
            <p>Set up your exam details to get started</p>
            <button class="close-modal-btn">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label for="examTitle">Exam Title</label>
              <input type="text" id="examTitle" class="form-control" placeholder="e.g., Mathematics Mid-term">
            </div>
            
            <div class="form-group">
              <label for="examCourse">Subject Area</label>
              <div class="select-wrapper">
                <select id="examCourse" class="form-control">
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="History">History</option>
                  <option value="Literature">Literature</option>
                  <option value="other">Other</option>
                </select>
                <div class="select-arrow">&#9662;</div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="examDate">Exam Date</label>
                <div class="date-input-wrapper">
                  <input type="date" id="examDate" class="form-control">
                  <button class="calendar-button"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNhbGVuZGFyIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjQiIHJ4PSIyIiByeT0iMiIvPjxsaW5lIHgxPSIxNiIgeTE9IjIiIHgyPSIxNiIgeTI9IjYiLz48bGluZSB4MT0iOCIgeTE9IjIiIHgyPSI4IiB5Mj0iNiIvPjxsaW5lIHgxPSIzIiB5MT0iMTAiIHgyPSIyMSIgeTI9IjEwIi8+PC9zdmc+" alt="Calendar"></button>
                </div>
              </div>
              
              <div class="form-group half">
                <label for="examTime">Exam Time</label>
                <input type="time" id="examTime" class="form-control">
              </div>
            </div>
            
            <div class="form-group">
              <label for="examLocation">Location (Optional)</label>
              <input type="text" id="examLocation" class="form-control" placeholder="e.g., Room 203">
            </div>
            
            <div class="form-group">
              <label for="examNotes">Notes (Optional)</label>
              <textarea id="examNotes" class="form-control" rows="3" placeholder="Any additional notes about this exam"></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button id="cancelExamBtn" class="btn-secondary">Cancel</button>
            <button id="saveExamBtn" class="btn-primary">
              <span class="plus-icon">+</span> Create Exam
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Append modal to the document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Add event listeners
    document.getElementById('cancelExamBtn').addEventListener('click', closeExamForm);
    document.getElementById('saveExamBtn').addEventListener('click', saveExam);
    document.querySelector('#examFormModal .close-modal-btn').addEventListener('click', closeExamForm);
    
    // Close modal when clicking outside
    const modal = document.getElementById('examFormModal');
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeExamForm();
      }
    });
  }
  
  /**
   * Initialize the exam details modal
   */
  function initializeExamDetailsModal() {
    const detailsModal = document.getElementById('examDetailsModal');
    
    if (!detailsModal) {
      // Create modal if it doesn't exist
      const modalHTML = `
        <div id="examDetailsModal" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="examDetailsTitle">Exam Details</h2>
              <button class="close-modal-btn">&times;</button>
            </div>
            <div class="modal-body" id="examDetailsContent">
              <!-- Exam details will be populated dynamically -->
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" id="closeExamDetailsBtn">Close</button>
              <button class="btn-primary" id="editExamBtn">Edit</button>
              <button class="btn-danger" id="deleteExamBtn">Delete</button>
            </div>
          </div>
        </div>
      `;
      
      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHTML;
      document.body.appendChild(modalContainer.firstElementChild);
    }
    
    // Add event listeners
    document.querySelector('#examDetailsModal .close-modal-btn').addEventListener('click', closeExamDetails);
    document.getElementById('closeExamDetailsBtn').addEventListener('click', closeExamDetails);
    document.getElementById('editExamBtn').addEventListener('click', editCurrentExam);
    document.getElementById('deleteExamBtn').addEventListener('click', deleteCurrentExam);
    
    // Close modal when clicking outside
    const modal = document.getElementById('examDetailsModal');
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeExamDetails();
      }
    });
  }
  
    // Track the current exam being edited (if any)
    let currentExamId = null;
  
    /**
     * Open the exam form
     * @param {Object} examData - Optional exam data for editing
     */
    function openExamForm(examData = null) {
      const modal = document.getElementById('examFormModal');
      const titleElement = document.getElementById('examFormTitle');
      
      // Clear the form
      document.getElementById('examTitle').value = '';
      document.getElementById('examCourse').value = 'Mathematics';
      document.getElementById('examDate').value = '';
      document.getElementById('examTime').value = '';
      document.getElementById('examLocation').value = '';
      document.getElementById('examNotes').value = '';
      
      // If editing an existing exam
      if (examData) {
        titleElement.textContent = 'Edit Exam';
        currentExamId = examData.id;
        
        // Fill the form with exam data
        document.getElementById('examTitle').value = examData.title;
        document.getElementById('examCourse').value = examData.course;
        
        // Format date for the input (YYYY-MM-DD)
        const dateObj = new Date(examData.date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        document.getElementById('examDate').value = `${year}-${month}-${day}`;
        
        // Extract time from the time string if available
        if (examData.time) {
          const timeParts = examData.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = timeParts[2];
            const period = timeParts[3];
            
            // Convert to 24-hour format for the time input
            if (period && period.toUpperCase() === 'PM' && hours < 12) {
              hours += 12;
            } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
              hours = 0;
            }
            
            document.getElementById('examTime').value = `${String(hours).padStart(2, '0')}:${minutes}`;
          }
        }
        
        // Optional fields
        if (examData.location) document.getElementById('examLocation').value = examData.location;
        if (examData.notes) document.getElementById('examNotes').value = examData.notes;
      } else {
        titleElement.textContent = 'Add New Exam';
        currentExamId = null;
        
        // Set default values
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('examDate').value = `${year}-${month}-${day}`;
      }
      
      // Display the modal
      modal.style.display = 'flex';
    }
  
    /**
     * Close the exam form
     */
    function closeExamForm() {
      const modal = document.getElementById('examFormModal');
      modal.style.display = 'none';
      currentExamId = null;
    }
  
    /**
     * Save the exam data
     */
    function saveExam() {
      const title = document.getElementById('examTitle').value.trim();
      const course = document.getElementById('examCourse').value;
      const dateStr = document.getElementById('examDate').value;
      const timeStr = document.getElementById('examTime').value;
      const location = document.getElementById('examLocation').value.trim();
      const notes = document.getElementById('examNotes').value.trim();
      
      // Validate required fields
      if (!title || !dateStr || !timeStr) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Create date object
      const date = new Date(dateStr);
      
      // Format time for display (12-hour format with AM/PM)
      let formattedTime = '';
      if (timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        formattedTime = `${formattedHour}:${minutes} ${ampm}`;
      }
      
      // Create exam object
      const examData = {
        title,
        course,
        date,
        time: formattedTime,
        location,
        notes
      };
      
      // Determine exam type based on course
      if (course.toLowerCase().includes('math')) {
        examData.type = 'math-exam';
      } else if (course.toLowerCase().includes('physics')) {
        examData.type = 'physics-exam';
      } else if (course.toLowerCase().includes('computer') || course.toLowerCase().includes('cs')) {
        examData.type = 'cs-exam';
      } else {
        examData.type = 'other-exam';
      }
      
      // Save the exam
      if (currentExamId) {
        // Update existing exam
        examData.id = currentExamId;
        updateExamEvent(currentExamId, examData);
      } else {
        // Add new exam
        addExamEvent(examData);
      }
      
      // Close the form
      closeExamForm();
    }
  
    // ===== EXAM DETAILS MODAL =====
  
    /**
     * Initialize the exam details modal
     */
    function initializeExamDetailsModal() {
      const detailsModal = document.getElementById('examDetailsModal');
      
      if (!detailsModal) {
        // Create modal if it doesn't exist
        const modalHTML = `
          <div id="examDetailsModal" class="modal">
            <div class="modal-content">
              <div class="modal-header">
                <h2 id="examDetailsTitle">Exam Details</h2>
                <button class="close-modal-btn">&times;</button>
              </div>
              <div class="modal-body" id="examDetailsContent">
                <!-- Exam details will be populated dynamically -->
              </div>
              <div class="modal-footer">
                <button class="btn-secondary" id="closeExamDetailsBtn">Close</button>
                <button class="btn-primary" id="editExamBtn">Edit</button>
                <button class="btn-danger" id="deleteExamBtn">Delete</button>
              </div>
            </div>
          </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
      }
      
      // Add event listeners
      document.querySelector('#examDetailsModal .close-modal-btn').addEventListener('click', closeExamDetails);
      document.getElementById('closeExamDetailsBtn').addEventListener('click', closeExamDetails);
      document.getElementById('editExamBtn').addEventListener('click', editCurrentExam);
      document.getElementById('deleteExamBtn').addEventListener('click', deleteCurrentExam);
      
      // Close modal when clicking outside
      const modal = document.getElementById('examDetailsModal');
      window.addEventListener('click', function(event) {
        if (event.target === modal) {
          closeExamDetails();
        }
      });
    }
  
    // Track the currently displayed exam
    let currentViewingExam = null;
  
    /**
     * Show exam details in the modal
     * @param {Object} exam - Exam object to display
     */
    function showExamDetails(exam) {
      const modal = document.getElementById('examDetailsModal');
      const contentElement = document.getElementById('examDetailsContent');
      
      // Store the current exam
      currentViewingExam = exam;
      
      // Format the date for display
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = exam.date.toLocaleDateString('en-US', dateOptions);
      
      // Create the content
      let content = `
        <div class="exam-details-container ${exam.type}">
          <div class="exam-detail-row">
            <div class="detail-label">Course:</div>
            <div class="detail-value">${exam.course}</div>
          </div>
          <div class="exam-detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">${formattedDate}</div>
          </div>
          <div class="exam-detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">${exam.time}</div>
          </div>
      `;
      
      // Add optional fields if they exist
      if (exam.location) {
        content += `
          <div class="exam-detail-row">
            <div class="detail-label">Location:</div>
            <div class="detail-value">${exam.location}</div>
          </div>
        `;
      }
      
      if (exam.notes) {
        content += `
          <div class="exam-detail-row">
            <div class="detail-label">Notes:</div>
            <div class="detail-value notes">${exam.notes}</div>
          </div>
        `;
      }
      
      content += '</div>';
      
      // Set the title and content
      document.getElementById('examDetailsTitle').textContent = exam.title;
      contentElement.innerHTML = content;
      
      // Show the modal
      modal.style.display = 'flex';
    }
  
    /**
     * Close the exam details modal
     */
    function closeExamDetails() {
      const modal = document.getElementById('examDetailsModal');
      modal.style.display = 'none';
      currentViewingExam = null;
    }
  
    /**
     * Edit the currently viewed exam
     */
    function editCurrentExam() {
      if (currentViewingExam) {
        closeExamDetails();
        openExamForm(currentViewingExam);
      }
    }
  
    /**
     * Delete the currently viewed exam
     */
    function deleteCurrentExam() {
      if (currentViewingExam && confirm('Are you sure you want to delete this exam?')) {
        deleteExamEvent(currentViewingExam.id);
        closeExamDetails();
      }
    }
  
    // ===== EXAM CRUD OPERATIONS =====
  
    /**
     * Add a new exam event
     * @param {Object} exam - Exam details object
     * @returns {boolean} Success status
     */
    function addExamEvent(exam) {
      // Validate exam object
      if (!exam.title || !exam.course || !exam.date || !exam.time) {
        console.error('Invalid exam event data', exam);
        return false;
      }
      
      // Add ID if not provided
      if (!exam.id) {
        exam.id = examEvents.length > 0 ? Math.max(...examEvents.map(e => e.id)) + 1 : 1;
      }
      
      // Add to events array
      examEvents.push(exam);
      
      // Refresh the calendar and course list
      generateCalendar(currentMonth, currentYear);
      updateCourseList();
      
      return true;
    }
  
    /**
     * Update an existing exam event
     * @param {number} examId - ID of the exam to update
     * @param {Object} updatedData - New exam data
     * @returns {boolean} Success status
     */
    function updateExamEvent(examId, updatedData) {
      const examIndex = examEvents.findIndex(exam => exam.id === examId);
      
      if (examIndex !== -1) {
        // Merge the updated data with existing exam
        examEvents[examIndex] = { ...examEvents[examIndex], ...updatedData };
        
        // Refresh the calendar and course list
        generateCalendar(currentMonth, currentYear);
        updateCourseList();
        return true;
      }
      
      return false;
    }
  
    /**
     * Delete an exam event by ID
     * @param {number} examId - ID of the exam to delete
     * @returns {boolean} Success status
     */
    function deleteExamEvent(examId) {
      const initialLength = examEvents.length;
      const indexToRemove = examEvents.findIndex(exam => exam.id === examId);
      
      if (indexToRemove !== -1) {
        examEvents.splice(indexToRemove, 1);
        generateCalendar(currentMonth, currentYear);
        updateCourseList();
        return true;
      }
      
      return false;
    }
  
    // ===== PUBLIC API =====
    // Export functions to make them available globally if needed
    window.auraCalendar = {
      addExamEvent,
      updateExamEvent,
      deleteExamEvent,
      refreshCalendar: () => generateCalendar(currentMonth, currentYear),
      goToMonth: (month, year) => {
        if (month >= 0 && month <= 11 && year >= 2020) {
          currentMonth = month;
          currentYear = year;
          generateCalendar(currentMonth, currentYear);
        }
      }
    };
  });