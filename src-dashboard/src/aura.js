/**
 * Dashboard Application
 * Handles all interactive functionality for the learning dashboard
 */

// Immediate-executing function to avoid global namespace pollution
(function() {
    // Wait for DOM content to be loaded
    document.addEventListener('DOMContentLoaded', async function() {
        // Initialize Supabase client
        try {
            const supabaseClient = supabase.createClient(
                'https://uumdfsnboqkounadxijq.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWRmc25ib3Frb3VuYWR4aWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDc5NzMsImV4cCI6MjA1NzkyMzk3M30.s3IDgE3c4kpaiRhCpaKATKdaZzdlTb91heIhrwDZrU0'
            );

            // Check if user is logged in
            const { data: { session } } = await supabaseClient.auth.getSession();
           
            if (!session) {
                window.location.href = '../../aura-login/login.html';
                return;
            }

            // Get user profile information
            const { data: profile, error } = await supabaseClient
                .from('profiles')
                .select('username, full_name')
                .eq('id', session.user.id)
                .single();
           
            if (error) {
                console.error('Error fetching user profile:', error);
            } else if (profile) {
                // Update welcome message
                const welcomeTextElement = document.querySelector('.welcome-text');
                if (welcomeTextElement) {
                    welcomeTextElement.textContent = `Welcome back, ${profile.username}!`;
                }

                // Update username in sidebar
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = profile.username;
                }
            }

            // Override logout button functionality for Supabase
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                const newLogoutButton = logoutButton.cloneNode(true);
                logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
               
                newLogoutButton.addEventListener('click', async () => {
                    try {
                        await supabaseClient.auth.signOut();
                        window.location.href = '../../aura-login/login.html';
                    } catch (error) {
                        console.error('Error signing out:', error);
                    }
                });
            }
            
            // Initialize dashboard with Supabase client
            const dashboard = new Dashboard(supabaseClient, session);
            window.dashboard = dashboard;
        } catch (error) {
            console.error('Supabase initialization error:', error);
            
            // Fall back to regular dashboard without Supabase
            const dashboard = new Dashboard();
            window.dashboard = dashboard;
        }
    });

class Dashboard {
    constructor(supabaseClient = null, session = null) {
        // Store Supabase client for database operations
        this.supabaseClient = supabaseClient;
        this.session = session;
        this.isConnected = !!supabaseClient;
        
        // Remove any existing error messages
        this.clearErrorMessages();
        
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
            recentCoursesGrid: document.querySelector('.recent-courses .courses-grid'),
            additionalCoursesGrid: document.querySelector('.additional-courses .courses-grid')
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
        this.clearErrorMessages = this.clearErrorMessages.bind(this);
        this.dismissErrorMessage = this.dismissErrorMessage.bind(this);

        // Initialize the dashboard
        this.init();
    }

    /**
     * Clear all error messages
     */
    clearErrorMessages() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.remove());
    }
    
    /**
     * Dismiss a specific error message
     */
    dismissErrorMessage(event) {
        const errorMessage = event.target.closest('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Initialize all dashboard components
     */
    async init() {
        this.updateDate();
        
        try {
            // Load all data in parallel
            await Promise.all([
                this.loadRecentCourses().catch(err => console.error('Failed to load courses:', err)),
                this.loadTasks().catch(err => console.error('Failed to load tasks:', err)),
                this.loadAchievements().catch(err => console.error('Failed to load achievements:', err)),
                this.loadStats().catch(err => console.error('Failed to load stats:', err))
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Continue with initialization despite errors
        }
        
        this.initializeProgressBars();
        this.initializeNavigation();
        this.initializeCalendar();
        this.updateStreak();
        this.setupPeriodicUpdates();
        this.setupLogoutButton();
    }

    async loadTasks() {
        try {
            if (this.isConnected && this.session) {
                // Try to get tasks from database
                const { data: dbTasks, error } = await this.supabaseClient
                    .from('tasks')
                    .select('*')
                    .eq('user_id', this.session.user.id)
                    .order('date', { ascending: true });
                
                if (error) throw error;
                
                if (dbTasks && dbTasks.length > 0) {
                    // Transform DB tasks to app format
                    this.state.tasks = dbTasks.map(task => ({
                        id: task.id,
                        name: task.title,
                        description: task.description,
                        date: new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        priority: task.priority || 'blue'
                    }));
                    
                    // Update UI
                    this.updateTasksUI();
                    return;
                }
            }
            
            // If not connected or no DB tasks, use localStorage
            const tasksData = localStorage.getItem('tasks');
            this.state.tasks = tasksData ? JSON.parse(tasksData) : [];

            // No tasks yet? Create some default ones
            if (this.state.tasks.length === 0) {
                this.state.tasks = [
                    {
                        name: "Mathematics Quiz",
                        description: "Chapter 5: Calculus",
                        date: "Jan 20, 2025",
                        priority: "red"
                    },
                    {
                        name: "Web Development Review",
                        description: "JavaScript Basics",
                        date: "Jan 22, 2025",
                        priority: "blue"
                    },
                    {
                        name: "Project Deadline",
                        description: "Final Assignment",
                        date: "Jan 25, 2025",
                        priority: "green"
                    }
                ];
                // Save to localStorage for next time
                localStorage.setItem('tasks', JSON.stringify(this.state.tasks));
                
                // If connected, also save to database
                if (this.isConnected && this.session) {
                    this.state.tasks.forEach(async (task) => {
                        await this.supabaseClient.from('tasks').insert({
                            user_id: this.session.user.id,
                            title: task.name,
                            description: task.description,
                            date: new Date(task.date),
                            priority: task.priority
                        });
                    });
                }
            }

            // Update UI
            this.updateTasksUI();
        } catch (error) {
            console.error('Error loading tasks:', error);
            // Don't show error message for tasks - just log it
        }
    }
    
    updateTasksUI() {
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
    }

    async loadAchievements() {
        try {
            if (this.isConnected && this.session) {
                // Try to get achievements from database
                const { data: dbAchievements, error } = await this.supabaseClient
                    .from('user_achievements')
                    .select('*')
                    .eq('user_id', this.session.user.id)
                    .single();
                
                if (!error && dbAchievements) {
                    this.state.achievements = {
                        streak: dbAchievements.streak || 15,
                        studyHours: dbAchievements.study_hours || 45,
                        badges: dbAchievements.badges_earned || 12
                    };
                    
                    // Update UI
                    this.updateAchievementsUI();
                    return;
                }
            }
            
            // Use localStorage as fallback
            const achievementsData = localStorage.getItem('achievements');
            this.state.achievements = achievementsData ?
                JSON.parse(achievementsData) :
                { streak: 15, studyHours: 45, badges: 12 };

            // Save default achievements if not already saved
            if (!achievementsData) {
                localStorage.setItem('achievements', JSON.stringify(this.state.achievements));
                
                // If connected, also save to database
                if (this.isConnected && this.session) {
                    await this.supabaseClient.from('user_achievements').insert({
                        user_id: this.session.user.id,
                        streak: this.state.achievements.streak,
                        study_hours: this.state.achievements.studyHours,
                        badges_earned: this.state.achievements.badges
                    });
                }
            }

            // Update UI
            this.updateAchievementsUI();
        } catch (error) {
            console.error('Error loading achievements:', error);
            // Don't show error message - just log it
        }
    }
    
    updateAchievementsUI() {
        if (this.elements.achievementsList) {
            const achievements = [
                {
                    name: 'Current Streak',
                    value: `${this.state.achievements.streak} days`,
                    icon: 'https://cdn.builder.io/api/v1/image/assets/5b35dfe34207418398a5304200905620/dedd02c958d6119cf29edce3de4b632cabc24b02b81056ef1ca2c2cd3b0b180c?apiKey=5b35dfe34207418398a5304200905620&'
                },
                {
                    name: 'Study Hours',
                    value: `${this.state.achievements.studyHours}h`,
                    icon: 'https://cdn.builder.io/api/v1/image/assets/5b35dfe34207418398a5304200905620/d4d6ad0bd0889f500fc605b3b031fff543983dfbeace92199272980d0891d714?apiKey=5b35dfe34207418398a5304200905620&'
                },
                {
                    name: 'Badges Earned',
                    value: this.state.achievements.badges,
                    icon: 'https://cdn.builder.io/api/v1/image/assets/5b35dfe34207418398a5304200905620/96c9c637a328aa4182b38f1d991b4309d27d239bbab06a3eda5836a613859f2a?apiKey=5b35dfe34207418398a5304200905620&'
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

        // Update streak display in header
        if (this.elements.streakCount) {
            this.elements.streakCount.textContent = `${this.state.achievements.streak} Days`;
        }
    }

    async loadStats() {
        try {
            if (this.isConnected && this.session) {
                // Try to get stats from database
                const { data: dbStats, error } = await this.supabaseClient
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', this.session.user.id)
                    .single();
                
                if (!error && dbStats) {
                    this.state.stats = {
                        coursesInProgress: dbStats.courses_in_progress || 4,
                        completedQuizzes: dbStats.completed_quizzes || 28,
                        flashcardsMastered: dbStats.flashcards_mastered || 156,
                        averageScore: dbStats.average_score || 85
                    };
                    
                    // Update UI
                    this.updateStatsUI();
                    return;
                }
            }
            
            // Use localStorage as fallback
            const statsData = localStorage.getItem('stats');
            this.state.stats = statsData ?
                JSON.parse(statsData) :
                {
                    coursesInProgress: 4,
                    completedQuizzes: 28,
                    flashcardsMastered: 156,
                    averageScore: 85
                };

            // Save default stats if not already saved
            if (!statsData) {
                localStorage.setItem('stats', JSON.stringify(this.state.stats));
                
                // If connected, also save to database
                if (this.isConnected && this.session) {
                    await this.supabaseClient.from('user_stats').insert({
                        user_id: this.session.user.id,
                        courses_in_progress: this.state.stats.coursesInProgress,
                        completed_quizzes: this.state.stats.completedQuizzes,
                        flashcards_mastered: this.state.stats.flashcardsMastered,
                        average_score: this.state.stats.averageScore
                    });
                }
            }

            // Update UI
            this.updateStatsUI();
        } catch (error) {
            console.error('Error loading stats:', error);
            // Don't show error message - just log it
        }
    }
    
    updateStatsUI() {
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
        // Clear any existing error messages first
        this.clearErrorMessages();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        // Add a close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'error-close-btn';
        closeButton.style.cssText = 'position:absolute; right:10px; top:10px; background:none; border:none; font-size:20px; cursor:pointer; color:#dc2626; padding:5px;';
        closeButton.addEventListener('click', this.dismissErrorMessage);
        
        const messageP = document.createElement('p');
        messageP.textContent = message;
        
        errorDiv.appendChild(messageP);
        errorDiv.appendChild(closeButton);
        errorDiv.style.position = 'relative'; // For proper close button positioning
        
        document.body.insertBefore(errorDiv, document.body.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                errorDiv.remove();
            }
        }, 5000);
    }

    setupLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', this.handleLogout);
        }
    }

    async handleLogout() {
        try {
            if (this.supabaseClient) {
                await this.supabaseClient.auth.signOut();
            }
            // Navigate to login page
            window.location.href = '../../aura-login/login.html';
        } catch (error) {
            console.error('Error during logout:', error);
            // Still attempt to redirect on error
            window.location.href = '../../aura-login/login.html';
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

        // Get nav text to determine which page to navigate to
        const navText = clickedItem.querySelector('.nav-text').textContent.trim();

        // Navigate based on the nav item text
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
        // Calendar will be initialized by the Calendar class
    }

    /**
     * Update streak information
     */
    updateStreak() {
        if (this.elements.streakCount) {
            this.elements.streakCount.textContent = `${this.state.achievements.streak} Days`;
        }
    }

    /**
     * Setup periodic updates for dynamic content
     */
    setupPeriodicUpdates() {
        setInterval(this.updateDate, 60000);
        setInterval(this.updateStreak, 300000);
    }

    async loadRecentCourses() {
        try {
            let courses = [];
            
            if (this.isConnected && this.session) {
                // Try to get courses from database
                const { data: dbCourses, error } = await this.supabaseClient
                    .from('user_courses')
                    .select('*')
                    .eq('user_id', this.session.user.id)
                    .order('last_accessed', { ascending: false });
                
                if (!error && dbCourses && dbCourses.length > 0) {
                    // Transform DB courses to app format
                    courses = dbCourses.map(course => ({
                        id: course.id,
                        name: course.title,
                        knowledgeLevel: course.progress_percentage || 0,
                        examDate: new Date(course.next_exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        timestamp: new Date(course.last_accessed).getTime()
                    }));
                }
            }
            
            // If no courses from DB, use localStorage
            if (courses.length === 0) {
                // Define default courses if none exist
                let defaultCourses = [
                    {
                        id: 'math-101',
                        name: 'Advanced Mathematics',
                        knowledgeLevel: 75,
                        examDate: 'Jan 20, 2025',
                        timestamp: Date.now() - 1000
                    },
                    {
                        id: 'web-dev',
                        name: 'Web Development',
                        knowledgeLevel: 45,
                        examDate: 'Jan 22, 2025',
                        timestamp: Date.now() - 2000
                    },
                    {
                        id: 'ai-intro',
                        name: 'Introduction to AI',
                        knowledgeLevel: 75,
                        examDate: 'Jan 20, 2025',
                        timestamp: Date.now() - 3000
                    },
                    {
                        id: 'data-sci',
                        name: 'Data Science Basics',
                        knowledgeLevel: 45,
                        examDate: 'Jan 22, 2025',
                        timestamp: Date.now() - 4000
                    }
                ];

                // Try to get courses from localStorage
                const coursesData = localStorage.getItem('courses');
               
                if (coursesData) {
                    courses = JSON.parse(coursesData);
                } else {
                    // If no courses in localStorage, use default courses
                    courses = defaultCourses;
                    // Save to localStorage
                    localStorage.setItem('courses', JSON.stringify(courses));
                    
                    // If connected, also save to database
                    if (this.isConnected && this.session) {
                        try {
                            for (const course of courses) {
                                await this.supabaseClient.from('user_courses').insert({
                                    user_id: this.session.user.id,
                                    title: course.name,
                                    progress_percentage: course.knowledgeLevel,
                                    next_exam_date: new Date(course.examDate),
                                    last_accessed: new Date(course.timestamp)
                                });
                            }
                        } catch (error) {
                            console.error('Failed to save courses to database:', error);
                        }
                    }
                }
            }

            // Sort courses by last accessed/modified date
            courses.sort((a, b) => b.timestamp - a.timestamp);

            // Take only the most recent courses
            const recentCourses = courses.slice(0, 2);
            const additionalCourses = courses.slice(2, 4);

            // Update recent courses grid
            if (this.elements.recentCoursesGrid) {
                this.updateCoursesGrid(this.elements.recentCoursesGrid, recentCourses);
            }

            // Update additional courses grid
            if (this.elements.additionalCoursesGrid) {
                this.updateCoursesGrid(this.elements.additionalCoursesGrid, additionalCourses);
            }

            // Update course count in stats
            this.state.stats.coursesInProgress = courses.length;
            localStorage.setItem('stats', JSON.stringify(this.state.stats));
            
            // Also update in DB if connected
            if (this.isConnected && this.session) {
                try {
                    await this.supabaseClient.from('user_stats')
                        .update({ courses_in_progress: courses.length })
                        .eq('user_id', this.session.user.id);
                } catch (error) {
                    console.error('Failed to update course count in database:', error);
                }
            }
        } catch (error) {
            console.error('Error loading recent courses:', error);
            // Don't show error message - just log it
        }
    }

    updateCoursesGrid(gridElement, courses) {
        gridElement.innerHTML = '';

        if (courses.length === 0) {
            const noCourseMessage = document.createElement('div');
            noCourseMessage.className = 'no-courses-message';
            noCourseMessage.innerHTML = `
                <p>No courses yet! Get started by adding a course in the My Courses section.</p>
                <button class="add-course-btn" onclick="window.location.href='mycourses.html'">
                    Add Your First Course
                </button>
            `;
            gridElement.appendChild(noCourseMessage);
            return;
        }

        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.dataset.id = course.id;
           
            // Calculate progress color based on knowledge level
            const progressColor = this.getProgressColor(course.knowledgeLevel);
           
            courseCard.innerHTML = `
                <div class="course-header">
                    <div class="course-title">${course.name}</div>
                    <div class="course-progress">${course.knowledgeLevel}%</div>
                </div>
                <div class="course-details">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.knowledgeLevel}%; background-color: ${progressColor};"></div>
                    </div>
                    <div class="next-quiz">
                        <div class="quiz-icon">
                            <img loading="lazy" src="https://cdn.builder.io/api/v1/image/assets/5b35dfe34207418398a5304200905620/803f968344ac8f67ddc90a340de1226f4c77c8f471be192f9d2bfa5d901deda3?apiKey=5b35dfe34207418398a5304200905620&" class="quiz-image" alt="Quiz icon" />
                        </div>
                        <div class="quiz-date">Next Quiz: ${course.examDate || 'Not set'}</div>
                    </div>
                </div>
            `;

            // Add click handler to navigate to course page
            courseCard.addEventListener('click', async () => {
                // Store current course data
                localStorage.setItem('currentCourse', JSON.stringify(course));
                
                // Update last accessed time in database if connected
                if (this.isConnected && this.session) {
                    try {
                        await this.supabaseClient
                            .from('user_courses')
                            .update({ last_accessed: new Date() })
                            .eq('id', course.id);
                    } catch (error) {
                        console.error('Failed to update course access time:', error);
                    }
                }
                
                // Navigate to course page
                window.location.href = `coursepage.html?id=${course.id}`;
            });

            gridElement.appendChild(courseCard);
        });
    }
}

/**
 * Calendar class to handle calendar functionality
 */
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
   
        // Get the current week's Sunday
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
       
        // Update event listeners for prev/next buttons
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
                dayNumberElement.style.color = '#000000';
                dayNumberElement.style.fontWeight = 'bold';
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
        
        // Find and highlight the clicked day
        const dayElements = document.querySelectorAll('.calendar-day');
        dayElements.forEach(dayElement => {
            if (parseInt(dayElement.querySelector('.day-number').textContent) === date.getDate() &&
                dayElement.classList.contains('current-month')) {
                dayElement.classList.add('selected');
            }
        });

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

// Expose the Dashboard class to the global scope
window.Dashboard = Dashboard;
})();

// Initialize Calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize Calendar if not already initialized
    if (!window.calendarInitialized) {
        const calendar = new Calendar();
        window.calendarInitialized = true;
    }
    
    // Add CSS for error message close button
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            position: relative;
            text-align: center;
            padding: 1rem 2rem 1rem 1rem;
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            border-radius: 8px;
            margin: 1rem auto;
            max-width: 90%;
            z-index: 1000;
        }
        
        .error-close-btn {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #dc2626;
            padding: 5px;
        }
        
        .error-close-btn:hover {
            color: #b91c1c;
        }
        
        .error-message p {
            color: #dc2626;
            font-weight: 500;
            margin: 0;
        }
    `;
    document.head.appendChild(style);
});