/**
 * Dashboard Application
 * Handles all interactive functionality for the learning dashboard
 */

class Dashboard {
    constructor() {
        // Cache DOM elements
        this.elements = {
            date: document.querySelector('.current-date'),
            streakCount: document.querySelector('.streak-count'),
            streakText: document.querySelector('.streak-text'),
            progressBars: document.querySelectorAll('.progress-bar'),
            navItems: document.querySelectorAll('.nav-item'),
            calendar: document.querySelector('.calendar-grid'),
            tasksList: document.querySelector('.tasks-list'),
            achievementsList: document.querySelector('.achievements-list'),
            statsGrid: document.querySelector('.stats-grid'),
            recentCoursesGrid: document.querySelector('.courses-grid')
        };

        // Initialize state
        this.state = {
            tasks: [],
            achievements: {
                streak: 0,
                studyHours: 0,
                badges: 0
            },
            stats: {
                coursesInProgress: 0,
                completedQuizzes: 0,
                flashcardsMastered: 0,
                averageScore: 0
            }
        };

        // Bind methods
        this.updateDate = this.updateDate.bind(this);
        this.updateStreak = this.updateStreak.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.loadRecentCourses = this.loadRecentCourses.bind(this);
        this.loadTasks = this.loadTasks.bind(this);
        this.loadAchievements = this.loadAchievements.bind(this);
        this.loadStats = this.loadStats.bind(this);

        // Initialize the dashboard
        this.init();

        // Add this inside the Dashboard class constructor
        this.initializeProgressListeners();
    }

    async init() {
        this.updateDate();
        await Promise.all([
            this.loadRecentCourses(),
            this.loadTasks(),
            this.loadAchievements(),
            this.loadStats()
        ]);
        this.initializeProgressBars();
        this.initializeNavigation();
        this.initializeCalendar();
        this.updateStreak();
        this.setupPeriodicUpdates();
        this.setupLogoutButton();
    }

    async loadTasks() {
        try {
            // Try to get tasks from localStorage
            const tasksData = localStorage.getItem('tasks');
            this.state.tasks = tasksData ? JSON.parse(tasksData) : [];

            // Update UI
            if (this.elements.tasksList) {
                if (this.state.tasks.length === 0) {
                    this.elements.tasksList.innerHTML = `
                        <div class="no-content-message">
                            <p>No upcoming tasks yet</p>
                        </div>
                    `;
                } else {
                    this.elements.tasksList.innerHTML = this.state.tasks
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(task => `
                            <div class="task-item">
                                <div class="task-content">
                                    <div class="task-indicator ${task.priority}"></div>
                                    <div class="task-details">
                                        <div class="task-info">
                                            <div class="task-name">${task.name}</div>
                                            <div class="task-description">${task.description}</div>
                                        </div>
                                        <div class="task-date">${task.date}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showErrorMessage('Error loading tasks');
        }
    }

    async loadAchievements() {
        try {
            // Try to get achievements from localStorage
            const achievementsData = localStorage.getItem('achievements');
            this.state.achievements = achievementsData ? 
                JSON.parse(achievementsData) : 
                { streak: 0, studyHours: 0, badges: 0 };

            // Update UI
            if (this.elements.achievementsList) {
                const achievements = [
                    { 
                        name: 'Current Streak', 
                        value: `${this.state.achievements.streak} days`, 
                        icon: 'https://cdn.builder.io/api/v1/image/assets/5b35dfe34207418398a5304200905620/b3491cd45f9406679e1482b630bd2f51c186936e7f33c5260ef268c12455a1b1?apiKey=5b35dfe34207418398a5304200905620&'
                    },
                    { 
                        name: 'Study Hours', 
                        value: `${this.state.achievements.studyHours}h`, 
                        icon: 'https://cdn.builder.io/api/v1/image/assets/5b35dfe34207418398a5304200905620/9447e2aa5c597dcd39d0a9bc7b4cabdf945a9cdbd8076eff279bc84f66090d2d?apiKey=5b35dfe34207418398a5304200905620&'
                    },
                    { 
                        name: 'Badges Earned', 
                        value: this.state.achievements.badges, 
                        icon: 'https://cdn.builder.io/api/v1/image/assets/5b35dfe34207418398a5304200905620/7e4782e6f1f5afa6efe604f03bf1347075561660a5ea58537e1a7208704514c4?apiKey=5b35dfe34207418398a5304200905620&'
                    }
                ];

                if (achievements.length === 0) {
                    this.elements.achievementsList.innerHTML = `
                        <div class="no-content-message">
                            <p>No achievements yet</p>
                        </div>
                    `;
                } else {
                    this.elements.achievementsList.innerHTML = achievements
                        .map(achievement => `
                            <div class="achievement-item">
                                <div class="achievement-label">
                                    <span class="icon-wrapper">
                                        <img src="${achievement.icon}" class="achievement-icon" alt="${achievement.name} icon" />
                                    </span>
                                    <span class="achievement-text">${achievement.name}</span>
                                </div>
                                <span class="achievement-value">${achievement.value}</span>
                            </div>
                        `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.showErrorMessage('Error loading achievements');
        }
    }

    async loadStats() {
        try {
            // Try to get stats from localStorage
            const statsData = localStorage.getItem('stats');
            this.state.stats = statsData ? 
                JSON.parse(statsData) : 
                {
                    coursesInProgress: 0,
                    completedQuizzes: 0,
                    flashcardsMastered: 0,
                    averageScore: 0
                };

            // Update UI
            if (this.elements.statsGrid) {
                const stats = [
                    { label: ['Courses in', 'Progress'], value: this.state.stats.coursesInProgress },
                    { label: ['Completed', 'Quizzes'], value: this.state.stats.completedQuizzes },
                    { label: ['Flashcards', 'Mastered'], value: this.state.stats.flashcardsMastered },
                    { label: ['Average Score'], value: `${this.state.stats.averageScore}%` }
                ];

                this.elements.statsGrid.innerHTML = `
                    <div class="stats-row">
                        ${stats.slice(0, 2).map(stat => this.createStatItem(stat)).join('')}
                    </div>
                    <div class="stats-row">
                        ${stats.slice(2, 4).map(stat => this.createStatItem(stat)).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            this.showErrorMessage('Error loading stats');
        }
    }

    createStatItem(stat) {
        return `
            <div class="stat-item">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">
                    ${stat.label.map(line => `<div>${line}</div>`).join('')}
                </div>
            </div>
        `;
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.insertBefore(errorDiv, document.body.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    setupLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', this.handleLogout);
        }
    }

    /**
     * Update the current date display
     */
    updateDate() {
        const currentDate = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        if (this.elements.date) {
            this.elements.date.textContent = currentDate.toLocaleDateString('en-US', options);
        }
    }

    /**
     * Initialize and update progress bars
     */
    initializeProgressBars() {
        this.elements.progressBars.forEach(bar => {
            try {
                const card = bar.closest('.course-card');
                if (!card) return;

                const progressText = card.querySelector('.course-progress');
                if (!progressText) return;

                const percentage = parseInt(progressText.textContent);
                const fill = bar.querySelector('.progress-fill');
                
                if (fill) {
                    fill.style.width = `${percentage}%`;
                    fill.style.backgroundColor = this.getProgressColor(percentage);
                }
            } catch (error) {
                console.error('Error initializing progress bar:', error);
            }
        });
    }

    /**
     * Get color based on progress percentage (original method)
     */
    getProgressColor(percentage) {
        if (percentage >= 75) return '#22c55e'; // Green
        if (percentage >= 50) return '#f59e0b'; // Orange
        if (percentage >= 25) return '#f97316'; // Light Red
        return '#ef4444'; // Red
    }

    /**
     * Get color based on progress percentage using the new color palette
     */
    getProgressColorUpdated(percentage) {
        let progressColor;
        let progressClass = '';
        
        if (percentage >= 75) {
            progressColor = '#5997ac'; // Primary - teal blue
            progressClass = 'progress-high';
        } else if (percentage >= 50) {
            progressColor = '#a1cbdd'; // Primary light - lighter blue
            progressClass = 'progress-medium';
        } else if (percentage >= 25) {
            progressColor = '#f7aec2'; // Accent - light pink
            progressClass = 'progress-low';
        } else {
            progressColor = '#af5166'; // Accent dark - darker pink/red
            progressClass = 'progress-very-low';
        }
        
        return progressColor;
    }

    /**
     * Initialize navigation functionality
     */
    initializeNavigation() {
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', this.handleNavigation);
        });
    }

    /**
     * Handle navigation item clicks,
     * EDIT ADDED: Additions made to work with the settings page
     */
    handleNavigation(event) {
        const clickedItem = event.currentTarget;

        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
        });
        clickedItem.classList.add('active');

        // get nav text to determine which page to navigate to 
        const navText = clickedItem.querySelector('.nav-text').textContent.trim();

        // navigate based on the nav item text
        switch(navText) {
            
            case 'Dashboard':
                window.location.href = 'aura.html';
                break;

            case 'Settings':
                window.location.href = 'settings.html';
                break;
            
            case 'My Courses':
                window.location.href = 'mycourses.html';
                break;

            case 'Calendar':
                window.location.href = 'calendar.html';
                break;
                
            case 'Progress Analytics':
                    window.location.href = 'progress-analytics.html';
                    break;

            case 'About Us':
                window.location.href = 'aboutus.html';
                break;

        }
    }

    /**
     * Initialize calendar display
     */
    initializeCalendar() {
        if (!this.elements.calendar) return;

        const currentDay = new Date().getDate();
        const days = this.elements.calendar.querySelectorAll('.calendar-day');

        days.forEach(day => {
            const dayNumber = parseInt(day.textContent);
            if (dayNumber === currentDay) {
                day.classList.add('active');
            }
        });
    }

    /**
     * Update streak information
     */
    updateStreak() {
        const { streakCount } = this.elements;
        
        if (streakCount) {
            const achievementsData = localStorage.getItem('achievements');
            const achievements = achievementsData ? JSON.parse(achievementsData) : { streak: 0 };
            streakCount.textContent = `${achievements.streak} Days`;
        }
    }

    /**
     * Setup periodic updates for dynamic content
     */
    setupPeriodicUpdates() {
        // Update date every minute
        setInterval(this.updateDate, 60000);
        
        // Update streak every 5 minutes
        setInterval(this.updateStreak, 300000);
    }

    /**
     * UPDATED: Load recent courses with circular donut chart and updated color palette
     */
    async loadRecentCourses() {
        try {
            // Try to get courses from localStorage first
            let courses = [];
            const coursesData = localStorage.getItem('courses');
            
            if (coursesData) {
                courses = JSON.parse(coursesData);
            } else {
                // If not in localStorage, try Cache API
                const cache = await caches.open('aura-courses-cache');
                const response = await cache.match('/courses-data');
                if (response) {
                    courses = await response.json();
                }
            }

            // Clear existing courses grid
            if (this.elements.recentCoursesGrid) {
                this.elements.recentCoursesGrid.innerHTML = '';

                // If no courses exist, show a message
                if (!courses || courses.length === 0) {
                    const noCourseMessage = document.createElement('div');
                    noCourseMessage.className = 'no-courses-message';
                    noCourseMessage.innerHTML = `
                        <p>No courses yet! Get started by adding a course in the My Courses section.</p>
                        <button class="add-course-btn" onclick="window.location.href='mycourses.html'">
                            Add Your First Course
                        </button>
                    `;
                    this.elements.recentCoursesGrid.appendChild(noCourseMessage);
                    return;
                }

                // Sort courses by last accessed/modified date
                courses.sort((a, b) => b.timestamp - a.timestamp);

                // Take only the most recent 4 courses
                const recentCourses = courses.slice(0, 4);

                // Add courses to the grid
                recentCourses.forEach(course => {
                    const courseRow = document.createElement('div');
                    courseRow.className = 'course-row';
                    
                    const courseCard = document.createElement('div');
                    courseCard.className = 'course-card interactive-card';
                    courseCard.dataset.id = course.id;
                    
                    // Calculate progress color based on knowledge level using new color palette
                    const progressColor = this.getProgressColorUpdated(course.knowledgeLevel);
                    
                    // Add high-progress class for courses with high progress
                    if (course.knowledgeLevel >= 80) {
                        courseCard.classList.add('high-progress');
                    }
                    
                    courseCard.innerHTML = `
                        <div class="course-header">
                            <div class="course-title">${course.name}</div>
                            <div class="course-progress">${course.knowledgeLevel}%</div>
                        </div>
                        <div class="course-details">
                            <div class="progress-donut-container">
                                <div class="progress-donut" style="--progress: ${course.knowledgeLevel}%; --progress-color: ${progressColor};"></div>
                                <div class="progress-percentage">${course.knowledgeLevel}%</div>
                            </div>
                            <div class="next-quiz">
                                <div class="quiz-icon">
                                    <i class="fas fa-calendar"></i>
                                </div>
                                <div class="quiz-date">Next Quiz: ${course.examDate || 'Not set'}</div>
                            </div>
                            <div class="course-actions hidden">
                                <button class="details-button">View Details</button>
                            </div>
                            <div class="course-stats hidden">
                                <div class="stat-item">
                                    <span class="stat-label">Last Studied</span>
                                    <span class="stat-value">${course.lastStudied || 'Never'}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Hours</span>
                                    <span class="stat-value">${course.studyHours || '0'}h</span>
                                </div>
                            </div>
                        </div>
                    `;

                    // Add hover event listeners
                    courseCard.addEventListener('mouseenter', () => {
                        const actionsElement = courseCard.querySelector('.course-actions');
                        const statsElement = courseCard.querySelector('.course-stats');
                        
                        if (actionsElement) actionsElement.classList.remove('hidden');
                        if (statsElement) statsElement.classList.remove('hidden');
                        
                        // Add card highlight effect
                        courseCard.classList.add('card-highlight');
                    });

                    courseCard.addEventListener('mouseleave', () => {
                        const actionsElement = courseCard.querySelector('.course-actions');
                        const statsElement = courseCard.querySelector('.course-stats');
                        
                        if (actionsElement) actionsElement.classList.add('hidden');
                        if (statsElement) statsElement.classList.add('hidden');
                        
                        // Remove card highlight effect
                        courseCard.classList.remove('card-highlight');
                    });

                    // Add click handler to navigate to course page
                    courseCard.addEventListener('click', (e) => {
                        // Don't navigate if clicking on action buttons
                        if (e.target.classList.contains('details-button')) {
                            e.stopPropagation();
                            
                            // Navigate to course details
                            localStorage.setItem('currentCourse', JSON.stringify(course));
                            window.location.href = `coursepage.html?id=${course.id}`;
                            return;
                        }
                        
                        // Default navigation to course page
                        localStorage.setItem('currentCourse', JSON.stringify(course));
                        window.location.href = `coursepage.html?id=${course.id}`;
                    });

                    courseRow.appendChild(courseCard);
                    this.elements.recentCoursesGrid.appendChild(courseRow);
                });
            }
        } catch (error) {
            console.error('Error loading recent courses:', error);
            // Show error message in the grid
            if (this.elements.recentCoursesGrid) {
                this.elements.recentCoursesGrid.innerHTML = `
                    <div class="error-message">
                        <p>Error loading courses. Please try refreshing the page.</p>
                    </div>
                `;
            }
        }
    }

    /**
     * UPDATED: Handle course action - simplified for single button
     */
    handleCourseAction(actionType, courseId) {
        const course = this.getCourseById(courseId);
        if (!course) return;
        
        // Now we only have a 'details' action type
        if (actionType === 'details') {
            // Navigate to course details
            localStorage.setItem('currentCourse', JSON.stringify(course));
            window.location.href = `coursepage.html?id=${course.id}`;
        }
    }

    /**
     * Helper method to get course by ID
     */
    getCourseById(courseId) {
        const coursesData = localStorage.getItem('courses');
        if (!coursesData) return null;
        
        const courses = JSON.parse(coursesData);
        return courses.find(course => course.id === courseId);
    }

    async handleLogout() {
        try {
            console.log('Logging out user...');
            
            // Clear user data from localStorage
            localStorage.removeItem('currentUsername');
            localStorage.removeItem('user_firstName');
            localStorage.removeItem('user_lastName');
            localStorage.removeItem('user_id');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('redirect_loop_protection');
            
            // Remove current user from session storage
            sessionStorage.removeItem('currentUser');
            
            // Check if user was remembered
            let savedUser = null;
            
            try {
                const cache = await caches.open('aura-user-cache');
                const response = await cache.match('/currentUser');
                
                if (response) {
                    savedUser = await response.json();
                }
            } catch (error) {
                console.log('Cache retrieval failed, using localStorage', error);
                const localData = localStorage.getItem('currentUser');
                savedUser = localData ? JSON.parse(localData) : null;
            }
            
            // Only remove from cache/localStorage if user is not "remembered"
            if (savedUser && !savedUser.remembered) {
                try {
                    const cache = await caches.open('aura-user-cache');
                    await cache.delete('/currentUser');
                } catch (error) {
                    console.log('Cache deletion failed', error);
                }
                localStorage.removeItem('currentUser');
            }
            
            console.log('Logout completed, redirecting to login page');
            
            // Redirect to login page
            window.location.href = '../../aura-login/login.html';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    // Add this method to the Dashboard class
    initializeProgressListeners() {
        // Listen for progress updates from coursepage
        window.addEventListener('courseProgressUpdated', (event) => {
            const { courseId, progress } = event.detail;
            this.updateCourseProgress(courseId, progress);
        });
    }

    // Add this method to the Dashboard class
    updateCourseProgress(courseId, progress) {
        // Update course card in dashboard
        const courseCard = document.querySelector(`.course-card[data-id="${courseId}"]`);
        if (courseCard) {
            const progressBadge = courseCard.querySelector('.course-progress');
            const progressFill = courseCard.querySelector('.progress-fill');
            
            if (progressBadge) {
                progressBadge.textContent = `${progress.overall}%`;
            }
            
            if (progressFill) {
                progressFill.style.width = `${progress.overall}%`;
                progressFill.style.backgroundColor = this.getProgressColorUpdated(progress.overall);
            }
        }
        
        // Update overall stats if needed
        this.loadStats();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    class Calendar {
        constructor() {
            this.today = new Date();
            this.currentDate = new Date();
            this.selectedDate = null;
            this.events = {
                '2025-01-20': { type: 'exam', title: 'Mathematics Quiz', course: 'Advanced Mathematics' },
                '2025-01-22': { type: 'exam', title: 'Web Development Review', course: 'Web Development' },
                '2025-01-25': { type: 'deadline', title: 'Project Deadline', course: 'Data Science' }
            };
        
            this.calendarDaysElement = document.querySelector('.calendar-days');
            this.monthYearElement = document.querySelector('.calendar-month-year');
            this.eventDetailsElement = document.querySelector('.event-details');
            
            // ADD THESE LINES
            this._prevMonthHandler = null;
            this._nextMonthHandler = null;
        
            this.initializeCalendar();
        }

        initializeCalendar() {
            this.renderCalendar();
            this.setupEventListeners();
        }

        setupEventListeners() {
            this._prevMonthHandler = () => {
                this.currentDate.setDate(this.currentDate.getDate() - 7);
                this.renderCalendar();
            };
            
            this._nextMonthHandler = () => {
                this.currentDate.setDate(this.currentDate.getDate() + 7);
                this.renderCalendar();
            };
            
            document.querySelector('.prev-month').addEventListener('click', this._prevMonthHandler);
            document.querySelector('.next-month').addEventListener('click', this._nextMonthHandler);
        }

        renderCalendar() {
            const monthYear = this.currentDate.toLocaleString('default', { 
                month: 'long', 
                year: 'numeric' 
            });
            this.monthYearElement.textContent = monthYear;
        
            this.calendarDaysElement.innerHTML = '';
        
            // REPLACE THE EXISTING CALENDAR RENDERING WITH THIS WEEK VIEW
            // Get the current week's Sunday (or Monday if you prefer week to start on Monday)
            const currentDay = new Date(this.currentDate);
            const dayOfWeek = currentDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
            
            // Calculate the start of the week (Sunday)
            const startOfWeek = new Date(currentDay);
            startOfWeek.setDate(currentDay.getDate() - dayOfWeek);
            
            // Create 7 days for the week view
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                
                const isCurrentMonth = date.getMonth() === this.currentDate.getMonth();
                const monthType = isCurrentMonth ? 'current-month' : 
                                  (date.getMonth() < this.currentDate.getMonth() ? 'prev-month' : 'next-month');
                
                const dayElement = this.createDayElement(date.getDate(), monthType, date);
                this.calendarDaysElement.appendChild(dayElement);
            }
            
            // MODIFY THE NAVIGATION BUTTONS TO MOVE BY WEEK INSTEAD OF MONTH
            // Update your event listeners for prev/next buttons:
            document.querySelector('.prev-month').removeEventListener('click', this._prevMonthHandler);
            document.querySelector('.next-month').removeEventListener('click', this._nextMonthHandler);
            
            this._prevMonthHandler = () => {
                this.currentDate.setDate(this.currentDate.getDate() - 7);
                this.renderCalendar();
            };
            
            this._nextMonthHandler = () => {
                this.currentDate.setDate(this.currentDate.getDate() + 7);
                this.renderCalendar();
            };
            
            document.querySelector('.prev-month').addEventListener('click', this._prevMonthHandler);
            document.querySelector('.next-month').addEventListener('click', this._nextMonthHandler);
        }

        createDayElement(dayNumber, monthType, date = null) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.classList.add(monthType);

            const dayNumberElement = document.createElement('span');
            dayNumberElement.classList.add('day-number');
            dayNumberElement.textContent = dayNumber;
            dayElement.appendChild(dayNumberElement);

            if (monthType === 'current-month' && date) {

                const today = new Date();
                if (date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear()) {
                    dayElement.classList.add('today');
                    dayNumberElement.style.color = '#000000'; // Make the day number black
                    dayNumberElement.style.fontWeight = 'bold'; // Optional: make it bold too
                }
                
                const dateString = date.toISOString().split('T')[0];
                
                if (this.events[dateString]) {
                    const eventIndicator = document.createElement('div');
                    eventIndicator.classList.add('event-indicator');
                    dayElement.appendChild(eventIndicator);
                    dayElement.classList.add('has-event');
                }

                dayElement.addEventListener('click', () => {
                    this.handleDateClick(date);
                });

                if (this.selectedDate && 
                    date.toDateString() === this.selectedDate.toDateString()) {
                    dayElement.classList.add('selected');
                }
            }

            return dayElement;
        }

        handleDateClick(date) {
            const prevSelected = document.querySelector('.calendar-day.selected');
            if (prevSelected) {
                prevSelected.classList.remove('selected');
            }

            this.selectedDate = date;

            const dateString = date.toISOString().split('T')[0];
            const clickedElement = document.querySelector(
                `.calendar-day.current-month:nth-child(${date.getDate() + 
                new Date(date.getFullYear(), date.getMonth(), 1).getDay()})`
            );
            if (clickedElement) {
                clickedElement.classList.add('selected');
            }

            this.showEventDetails(dateString);
        }

        showEventDetails(dateString) {
            const event = this.events[dateString];
            if (event) {
                this.eventDetailsElement.innerHTML = `
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-course">${event.course}</p>
                `;
                this.eventDetailsElement.classList.remove('hidden');
            } else {
                this.eventDetailsElement.classList.add('hidden');
            }
        }
    }

    const calendar = new Calendar();
});

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    window.dashboard = dashboard; // Make dashboard accessible globally
});

// initialize navigation links
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initializeNavigation === 'function') {
        initializeNavigation();
    }
});

// Progress Analytics navigation handler - works from any page
document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const navItems = document.querySelectorAll('.nav-item');
    const dashboardContent = document.querySelector('.dashboard > .body > .content-wrapper > .layout-container > .main-content-column');
    const sidebarColumn = document.querySelector('.dashboard > .body > .content-wrapper > .layout-container > .sidebar-column');
    const progressAnalyticsPage = document.querySelector('.progress-analytics-page');
    
    // For jQuery-like :contains selector
    const getElementByContainedText = (selector, text) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).find(element => 
            element.textContent.trim().includes(text)
        );
    };
    
    const progressAnalyticsItem = getElementByContainedText('.nav-item .nav-text', 'Progress Analytics')?.closest('.nav-item');
    
    // Check if Progress Analytics page exists, if not, add it to the DOM
    let analyticsPageExists = !!progressAnalyticsPage;
    let addedAnalyticsPage = null;
    
    if (!analyticsPageExists) {
      console.log('Progress Analytics page not found in DOM - will create if needed');
    }
    
    // Add event listeners to other nav items to handle returning to dashboard
    navItems.forEach(navItem => {
      // Skip the Progress Analytics item
      if (navItem !== progressAnalyticsItem) {
        navItem.addEventListener('click', function() {
          // Only handle dashboard display, don't interfere with original navigation
          const analytics = progressAnalyticsPage || addedAnalyticsPage;
          if (analytics && analytics.style.display === 'block') {
            console.log('Returning to dashboard from Analytics');
            if (dashboardContent) {
              dashboardContent.style.display = 'block';
            }
            analytics.style.display = 'none';
          }
        });
      }
    });
    
    // Override the Dashboard.handleNavigation for Progress Analytics
    setTimeout(function() {
      if (window.dashboard && typeof window.dashboard.handleNavigation === 'function') {
        const originalHandleNavigation = window.dashboard.handleNavigation;
        
        window.dashboard.handleNavigation = function(event) {
          const clickedItem = event.currentTarget;
          const navText = clickedItem.querySelector('.nav-text').textContent.trim();
          
          // Only call original handler if NOT Progress Analytics
          if (navText !== 'Progress Analytics') {
            originalHandleNavigation.call(window.dashboard, event);
          }
        };
        
        console.log('Dashboard navigation handler modified');
      }
    }, 200);
    
    // Check if we need to show analytics based on localStorage flag
    // This handles navigation from other pages
    if (localStorage.getItem('showProgressAnalytics') === 'true' && dashboardContent) {
      console.log('Found flag to show Progress Analytics');
      localStorage.removeItem('showProgressAnalytics');
      
      setTimeout(function() {
        if (progressAnalyticsItem) {
          // Simulate click on Progress Analytics
          progressAnalyticsItem.click();
        }
      }, 300); // Allow time for dashboard to initialize
    }
});

// Remove the demo data initialization code
document.addEventListener('DOMContentLoaded', function() {
    // Add event delegation for course details button
    const dashboardInstance = window.dashboard;
    if (dashboardInstance && dashboardInstance.elements && dashboardInstance.elements.recentCoursesGrid) {
        dashboardInstance.elements.recentCoursesGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('details-button')) {
                const courseCard = e.target.closest('.course-card');
                if (courseCard) {
                    const courseId = courseCard.dataset.id;
                    dashboardInstance.handleCourseAction('details', courseId);
                }
            }
        });
    }
});