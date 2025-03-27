// analytics-data-adapter.js
// This file serves as a centralized data source for the analytics features

// Flag to control whether to use real data or placeholder data
const USE_REAL_DATA = true; // Now set to true to use real API data

// Define API endpoints - adjust these based on your backend structure
const API_ENDPOINTS = {
  USER_PROFILE: '/api/user/profile',
  COURSE_PROGRESS: '/api/user/courses/progress',
  QUIZ_PERFORMANCE: '/api/user/quizzes/performance',
  STUDY_ACTIVITY: '/api/user/activity',
  SKILL_COVERAGE: '/api/user/skills',
  TOPIC_MASTERY: '/api/user/topics/mastery',
  UPDATE_QUIZ: '/api/user/quizzes/update',
  UPDATE_COURSE_PROGRESS: '/api/user/courses/update-progress',
  RECORD_STUDY_SESSION: '/api/user/activity/record'
};

// Student data interface
class AnalyticsDataService {
  constructor() {
    // Cache for data to avoid unnecessary API calls
    this.cache = {};
    this.cacheExpiration = {};
    this.DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Event system for data updates
    this.eventListeners = {
      'data-updated': [],
      'quiz-completed': [],
      'course-progress-updated': [],
      'course-completed': [],
      'error': []
    };
    
    // Initialize data refresh on page load
    this.refreshAllData();
    
    // Set up periodic refresh
    setInterval(() => this.refreshAllData(), 5 * 60 * 1000); // Refresh every 5 minutes
  }
  
  // Event handling methods
  addEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }
  
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }
  
  triggerEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }
  
  // Utility method for API calls
  async fetchAPI(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers needed
          // 'Authorization': `Bearer ${getAuthToken()}`
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      this.triggerEvent('error', { endpoint, error });
      throw error;
    }
  }
  
  // Cache management
  setCache(key, data, duration = this.DEFAULT_CACHE_DURATION) {
    this.cache[key] = data;
    this.cacheExpiration[key] = Date.now() + duration;
  }
  
  getCache(key) {
    if (this.cache[key] && this.cacheExpiration[key] > Date.now()) {
      return this.cache[key];
    }
    return null;
  }
  
  clearCache(key) {
    if (key) {
      delete this.cache[key];
      delete this.cacheExpiration[key];
    } else {
      this.cache = {};
      this.cacheExpiration = {};
    }
  }
  
  // Refresh all data from API
  async refreshAllData() {
    try {
      const data = await this.getAllAnalyticsData(true); // Force refresh
      this.triggerEvent('data-updated', data);
      return data;
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
      return null;
    }
  }
  
  // Get user profile data
  async getUserProfile(forceRefresh = false) {
    const cacheKey = 'userProfile';
    
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }
    
    if (USE_REAL_DATA) {
      try {
        const data = await this.fetchAPI(API_ENDPOINTS.USER_PROFILE);
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return this.getPlaceholderUserProfile(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderUserProfile();
    }
  }

  // Get course progress data
  async getCourseProgress(forceRefresh = false) {
    const cacheKey = 'courseProgress';
    
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }
    
    if (USE_REAL_DATA) {
      try {
        const data = await this.fetchAPI(API_ENDPOINTS.COURSE_PROGRESS);
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error fetching course progress:', error);
        return this.getPlaceholderCourseProgress(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderCourseProgress();
    }
  }

  // Get quiz performance data
  async getQuizPerformance(forceRefresh = false) {
    const cacheKey = 'quizPerformance';
    
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }
    
    if (USE_REAL_DATA) {
      try {
        const data = await this.fetchAPI(API_ENDPOINTS.QUIZ_PERFORMANCE);
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error fetching quiz performance:', error);
        return this.getPlaceholderQuizPerformance(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderQuizPerformance();
    }
  }

  // Get study activity data
  async getStudyActivity(forceRefresh = false) {
    const cacheKey = 'studyActivity';
    
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }
    
    if (USE_REAL_DATA) {
      try {
        const data = await this.fetchAPI(API_ENDPOINTS.STUDY_ACTIVITY);
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error fetching study activity:', error);
        return this.getPlaceholderStudyActivity(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderStudyActivity();
    }
  }

  // Get skill coverage data
  async getSkillCoverage(forceRefresh = false) {
    const cacheKey = 'skillCoverage';
    
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }
    
    if (USE_REAL_DATA) {
      try {
        const data = await this.fetchAPI(API_ENDPOINTS.SKILL_COVERAGE);
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error fetching skill coverage:', error);
        return this.getPlaceholderSkillCoverage(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderSkillCoverage();
    }
  }

  // Get topic mastery data
  async getTopicMastery(forceRefresh = false) {
    const cacheKey = 'topicMastery';
    
    if (!forceRefresh) {
      const cachedData = this.getCache(cacheKey);
      if (cachedData) return cachedData;
    }
    
    if (USE_REAL_DATA) {
      try {
        const data = await this.fetchAPI(API_ENDPOINTS.TOPIC_MASTERY);
        this.setCache(cacheKey, data);
        return data;
      } catch (error) {
        console.error('Error fetching topic mastery:', error);
        return this.getPlaceholderTopicMastery(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderTopicMastery();
    }
  }

  // Get all analytics data at once
  async getAllAnalyticsData(forceRefresh = false) {
    return {
      userProfile: await this.getUserProfile(forceRefresh),
      courseProgress: await this.getCourseProgress(forceRefresh),
      quizPerformance: await this.getQuizPerformance(forceRefresh),
      studyActivity: await this.getStudyActivity(forceRefresh),
      skillCoverage: await this.getSkillCoverage(forceRefresh),
      topicMastery: await this.getTopicMastery(forceRefresh)
    };
  }
  
  // Update methods for user actions
  
  // Record a completed quiz
  async recordQuizCompletion(quizData) {
    if (USE_REAL_DATA) {
      try {
        const result = await this.fetchAPI(API_ENDPOINTS.UPDATE_QUIZ, {
          method: 'POST',
          body: JSON.stringify(quizData)
        });
        
        // Clear relevant caches
        this.clearCache('quizPerformance');
        this.clearCache('skillCoverage');
        
        // Trigger event
        this.triggerEvent('quiz-completed', result);
        
        // Refresh affected data
        await this.getQuizPerformance(true);
        await this.getSkillCoverage(true);
        
        return result;
      } catch (error) {
        console.error('Error recording quiz completion:', error);
        return null;
      }
    } else {
      // Simulate a successful update in placeholder mode
      console.log('Quiz completion recorded (placeholder):', quizData);
      return { success: true, message: 'Quiz recorded (placeholder)' };
    }
  }
  
  // Update course progress
  async updateCourseProgress(progressData) {
    if (USE_REAL_DATA) {
      try {
        const result = await this.fetchAPI(API_ENDPOINTS.UPDATE_COURSE_PROGRESS, {
          method: 'POST',
          body: JSON.stringify(progressData)
        });
        
        // Clear relevant caches
        this.clearCache('courseProgress');
        
        // Trigger event
        this.triggerEvent('course-progress-updated', result);
        
        // Check if course is completed
        if (progressData.completed) {
          this.triggerEvent('course-completed', progressData.courseId);
        }
        
        // Refresh affected data
        await this.getCourseProgress(true);
        
        return result;
      } catch (error) {
        console.error('Error updating course progress:', error);
        return null;
      }
    } else {
      // Simulate a successful update in placeholder mode
      console.log('Course progress updated (placeholder):', progressData);
      return { success: true, message: 'Progress updated (placeholder)' };
    }
  }
  
  // Record study session
  async recordStudySession(sessionData) {
    if (USE_REAL_DATA) {
      try {
        const result = await this.fetchAPI(API_ENDPOINTS.RECORD_STUDY_SESSION, {
          method: 'POST',
          body: JSON.stringify(sessionData)
        });
        
        // Clear relevant caches
        this.clearCache('studyActivity');
        this.clearCache('userProfile'); // May affect streaks
        
        // Refresh affected data
        await this.getStudyActivity(true);
        await this.getUserProfile(true);
        
        return result;
      } catch (error) {
        console.error('Error recording study session:', error);
        return null;
      }
    } else {
      // Simulate a successful update in placeholder mode
      console.log('Study session recorded (placeholder):', sessionData);
      return { success: true, message: 'Session recorded (placeholder)' };
    }
  }

  // ===== PLACEHOLDER DATA =====
  // Modified to show empty/zero data initially

  getPlaceholderUserProfile() {
    return {
      name: "Sarah Johnson",
      currentStreak: 0,            // Changed from 15 to 0
      longestStreak: 0,            // Changed from 32 to 0
      totalStudyHours: 0,          // Changed from 24 to 0
      averageScore: 0,             // Changed from 85 to 0
      scoreImprovement: 0,         // Changed from 7 to 0
      productiveDay: null,         // Changed from 'Thursday' to null
      productiveDayPercent: 0,     // Changed from 30 to 0
      hasProductivityData: false,  // Changed from true to false
      hasPeakStudyTime: false,     // Changed from true to false
      peakStudyTime: null,         // Changed from 'evenings (7-9pm)' to null
      targetStreak: 10,            // Kept as a goal
      streakPercentage: 0,         // Changed from 37.5 to 0
      currentCourse: null,         // Changed from 'web-development' to null
      streakCount: 0,              // Changed from 15 to 0
      daysToRecord: 0              // Changed from 17 to 0
    };
  }

  getPlaceholderCourseProgress() {
    return {
      overallPercentage: 0,        // Changed from 75 to 0
      modulesCompleted: 0,         // Changed from 6 to 0
      totalModules: 0,             // Changed from 8 to 0
      estimatedCompletionDate: null, // Changed from date to null
      timeSpentTotal: 0,           // Changed from 24 to 0
      lastActivity: null,          // Changed from date to null
      courses: []                  // Changed from array with course to empty array
    };
  }

  getPlaceholderQuizPerformance() {
    return {
      completed: 0,                // Changed from 7 to 0
      pending: 0,                  // Changed from 3 to 0
      totalQuizzes: 0,             // Changed from 10 to 0
      averageScore: 0,             // Changed from 85 to 0
      highestScore: 0,             // Changed from 95 to 0
      lowestScore: 0,              // Changed from 70 to 0
      nextQuiz: null,              // Changed from object to null
      recentQuizzes: []            // Changed from array with quizzes to empty array
    };
  }

  getPlaceholderStudyActivity() {
    return {
      weeklyHours: [0, 0, 0, 0, 0, 0, 0], // Changed all values to 0
      totalHours: 0,                      // Changed from 24 to 0
      peakDay: null,                      // Changed from 'Thursday' to null
      peakHours: null,                    // Changed from '18:00-20:00' to null
      averageSessionLength: 0,            // Changed from 45 to 0
      averageDailyStudy: 0,               // Changed from 1.7 to 0
      activityHeatmap: []                 // Changed to empty array
    };
  }

  getPlaceholderSkillCoverage() {
    return {
      skills: [],                  // Changed from array of skills to empty array
      strengths: [],               // Changed from array with strengths to empty array
      areasForImprovement: []      // Changed from array with areas to empty array
    };
  }

  getPlaceholderTopicMastery() {
    return {
      topics: []                   // Changed from array with topics to empty array
    };
  }
}

// Create a singleton instance
const analyticsData = new AnalyticsDataService();

// Export the instance for use in other files
window.analyticsData = analyticsData;