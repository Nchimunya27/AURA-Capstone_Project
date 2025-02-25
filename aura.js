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
            tasks: document.querySelector('.tasks-list'),
            courseCards: document.querySelectorAll('.course-card'),
            statsContainer: document.querySelector('.quick-stats')
        };

        // Bind methods to maintain this context
        this.updateDate = this.updateDate.bind(this);
        this.updateStreak = this.updateStreak.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);

        // Initialize the dashboard
        this.init();
    }

    /**
     * Initialize all dashboard components
     */
    init() {
        this.updateDate();
        this.initializeProgressBars();
        this.initializeNavigation();
        this.initializeCalendar();
        this.updateStreak();
        this.initializeTaskList();
        this.initializeCourseCards();
        this.initializeQuickStats();
        this.setupPeriodicUpdates();
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
     * Get color based on progress percentage
     */
    getProgressColor(percentage) {
        if (percentage >= 75) return '#22c55e'; // Green
        if (percentage >= 50) return '#f59e0b'; // Orange
        if (percentage >= 25) return '#f97316'; // Light Red
        return '#ef4444'; // Red
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
     * Handle navigation item clicks
     */
    handleNavigation(event) {
        const clickedItem = event.currentTarget;
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
        });
        clickedItem.classList.add('active');
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
        const { streakCount, streakText } = this.elements;
        
        if (streakCount && streakText) {
            const days = parseInt(streakCount.textContent);
            streakText.textContent = `${days} day streak`;
        }
    }

    /**
     * Initialize task list with sorting and filtering
     */
    initializeTaskList() {
        if (!this.elements.tasks) return;

        const tasks = Array.from(this.elements.tasks.querySelectorAll('.task-item'));
        
        // Sort tasks by date
        tasks.sort((a, b) => {
            const dateA = new Date(a.querySelector('.task-date').textContent);
            const dateB = new Date(b.querySelector('.task-date').textContent);
            return dateA - dateB;
        });

        // Clear and reappend sorted tasks
        const tasksList = this.elements.tasks;
        tasksList.innerHTML = '';
        tasks.forEach(task => tasksList.appendChild(task));
    }

    /**
     * Initialize course cards with progress tracking
     */
    initializeCourseCards() {
        this.elements.courseCards.forEach(card => {
            // Add click event for course details
            card.addEventListener('click', () => {
                const courseTitle = card.querySelector('.course-title').textContent;
                this.showCourseDetails(courseTitle);
            });

            // Initialize progress indicators
            this.updateCourseProgress(card);
        });
    }

    /**
     * Update individual course progress
     */
    updateCourseProgress(card) {
        const progress = card.querySelector('.course-progress');
        const progressBar = card.querySelector('.progress-fill');

        if (progress && progressBar) {
            const percentage = parseInt(progress.textContent);
            progressBar.style.width = `${percentage}%`;
            progressBar.style.backgroundColor = this.getProgressColor(percentage);
        }
    }

    /**
     * Show course details (placeholder for modal/detailed view)
     */
    showCourseDetails(courseTitle) {
        console.log(`Showing details for: ${courseTitle}`);
        // Implementation for showing course details would go here
    }

    /**
     * Initialize quick stats display
     */
    initializeQuickStats() {
        if (!this.elements.statsContainer) return;

        const stats = {
            coursesInProgress: this.elements.courseCards.length,
            completedQuizzes: this.calculateCompletedQuizzes(),
            flashcardsMastered: this.calculateMasteredFlashcards(),
            averageScore: this.calculateAverageScore()
        };

        Object.entries(stats).forEach(([stat, value]) => {
            const element = this.elements.statsContainer.querySelector(`[data-stat="${stat}"]`);
            if (element) {
                element.textContent = stat === 'averageScore' ? `${value}%` : value;
            }
        });
    }

    /**
     * Calculate completed quizzes (placeholder)
     */
    calculateCompletedQuizzes() {
        return 28; // This would normally fetch from an API
    }

    /**
     * Calculate mastered flashcards (placeholder)
     */
    calculateMasteredFlashcards() {
        return 156; // This would normally fetch from an API
    }

    /**
     * Calculate average score (placeholder)
     */
    calculateAverageScore() {
        return 85; // This would normally fetch from an API
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

            this.initializeCalendar();
        }

        initializeCalendar() {
            this.renderCalendar();
            this.setupEventListeners();
        }

        setupEventListeners() {
            document.querySelector('.prev-month').addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });

            document.querySelector('.next-month').addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        renderCalendar() {
            const monthYear = this.currentDate.toLocaleString('default', { 
                month: 'long', 
                year: 'numeric' 
            });
            this.monthYearElement.textContent = monthYear;

            this.calendarDaysElement.innerHTML = '';

            const firstDayOfMonth = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                1
            );
            const lastDayOfMonth = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth() + 1,
                0
            );

            const firstDayWeekday = firstDayOfMonth.getDay();
            const prevMonthDays = new Date(
                this.currentDate.getFullYear(),
                this.currentDate.getMonth(),
                0
            ).getDate();

            for (let i = firstDayWeekday - 1; i >= 0; i--) {
                const dayElement = this.createDayElement(
                    prevMonthDays - i,
                    'prev-month'
                );
                this.calendarDaysElement.appendChild(dayElement);
            }

            for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
                const currentDate = new Date(
                    this.currentDate.getFullYear(),
                    this.currentDate.getMonth(),
                    day
                );
                const dayElement = this.createDayElement(day, 'current-month', currentDate);
                this.calendarDaysElement.appendChild(dayElement);
            }

            const totalCells = 42;
            const remainingCells = totalCells - 
                (firstDayWeekday + lastDayOfMonth.getDate());

            for (let day = 1; day <= remainingCells; day++) {
                const dayElement = this.createDayElement(day, 'next-month');
                this.calendarDaysElement.appendChild(dayElement);
            }
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
});