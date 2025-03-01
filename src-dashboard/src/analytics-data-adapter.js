// analytics-data-adapter.js
// This file serves as a centralized data source for the analytics features
// When real data becomes available, you only need to modify this file

// Flag to control whether to use real data or placeholder data
const USE_REAL_DATA = false; // Set to true when real data API is ready

// Student data interface
class AnalyticsDataService {
  constructor() {
    // Cache for data to avoid unnecessary API calls
    this.cache = {};
  }

  // Get user profile data
  async getUserProfile() {
    if (USE_REAL_DATA) {
      // Replace with your actual API call
      try {
        const response = await fetch('/api/user/profile');
        return await response.json();
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return this.getPlaceholderUserProfile(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderUserProfile();
    }
  }

  // Get course progress data
  async getCourseProgress() {
    if (USE_REAL_DATA) {
      // Replace with your actual API call
      try {
        const response = await fetch('/api/user/courses/progress');
        return await response.json();
      } catch (error) {
        console.error('Error fetching course progress:', error);
        return this.getPlaceholderCourseProgress(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderCourseProgress();
    }
  }

  // Get quiz performance data
  async getQuizPerformance() {
    if (USE_REAL_DATA) {
      // Replace with your actual API call
      try {
        const response = await fetch('/api/user/quizzes/performance');
        return await response.json();
      } catch (error) {
        console.error('Error fetching quiz performance:', error);
        return this.getPlaceholderQuizPerformance(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderQuizPerformance();
    }
  }

  // Get study activity data
  async getStudyActivity() {
    if (USE_REAL_DATA) {
      // Replace with your actual API call
      try {
        const response = await fetch('/api/user/activity');
        return await response.json();
      } catch (error) {
        console.error('Error fetching study activity:', error);
        return this.getPlaceholderStudyActivity(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderStudyActivity();
    }
  }

  // Get skill coverage data
  async getSkillCoverage() {
    if (USE_REAL_DATA) {
      // Replace with your actual API call
      try {
        const response = await fetch('/api/user/skills');
        return await response.json();
      } catch (error) {
        console.error('Error fetching skill coverage:', error);
        return this.getPlaceholderSkillCoverage(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderSkillCoverage();
    }
  }

  // Get topic mastery data
  async getTopicMastery() {
    if (USE_REAL_DATA) {
      // Replace with your actual API call
      try {
        const response = await fetch('/api/user/topics/mastery');
        return await response.json();
      } catch (error) {
        console.error('Error fetching topic mastery:', error);
        return this.getPlaceholderTopicMastery(); // Fallback to placeholder
      }
    } else {
      return this.getPlaceholderTopicMastery();
    }
  }

  // Get all analytics data at once
  async getAllAnalyticsData() {
    return {
      userProfile: await this.getUserProfile(),
      courseProgress: await this.getCourseProgress(),
      quizPerformance: await this.getQuizPerformance(),
      studyActivity: await this.getStudyActivity(),
      skillCoverage: await this.getSkillCoverage(),
      topicMastery: await this.getTopicMastery()
    };
  }

  // ===== PLACEHOLDER DATA =====

  getPlaceholderUserProfile() {
    return {
      name: "Sarah Johnson",
      currentStreak: 15,
      longestStreak: 32,
      totalStudyHours: 24,
      averageScore: 85,
      scoreImprovement: 7,
      productiveDay: 'Thursday',
      productiveDayPercent: 30,
      hasProductivityData: true,
      hasPeakStudyTime: true,
      peakStudyTime: 'evenings (7-9pm)',
      targetStreak: 40,
      streakPercentage: 37.5,
      currentCourse: 'web-development',
      streakCount: 15,
      daysToRecord: 17
    };
  }

  getPlaceholderCourseProgress() {
    return {
      overallPercentage: 75,
      modulesCompleted: 6,
      totalModules: 8,
      estimatedCompletionDate: 'May 15, 2025',
      timeSpentTotal: 24, // hours
      lastActivity: '2025-02-27T15:30:00Z',
      courses: [
        {
          id: 1,
          name: 'Web Development',
          progress: 75,
          modules: [{completed: true}, {completed: true}, {completed: true}, 
                   {completed: true}, {completed: true}, {completed: true}, 
                   {completed: false}, {completed: false}]
        }
      ]
    };
  }

  getPlaceholderQuizPerformance() {
    return {
      completed: 7,
      pending: 3,
      totalQuizzes: 10,
      averageScore: 85,
      highestScore: 95,
      lowestScore: 70,
      nextQuiz: {
        name: 'Arrays and Loops',
        date: 'Tomorrow',
        estimatedDifficulty: 'Medium'
      },
      recentQuizzes: [
        {
          name: 'Variables Quiz',
          date: 'May 1, 2025',
          score: 90,
          timeSpent: 15, // minutes
          status: 'completed'
        },
        {
          name: 'Functions Quiz',
          date: 'May 3, 2025',
          score: 85,
          timeSpent: 20, // minutes
          status: 'completed'
        },
        {
          name: 'Loops Quiz',
          date: 'May 6, 2025',
          score: 75,
          timeSpent: 25, // minutes
          status: 'completed'
        },
        {
          name: 'Arrays Quiz',
          date: null,
          score: null,
          timeSpent: null,
          status: 'pending'
        },
        {
          name: 'Objects Quiz',
          date: null,
          score: null,
          timeSpent: null,
          status: 'pending'
        }
      ]
    };
  }

  getPlaceholderStudyActivity() {
    return {
      weeklyHours: [2.5, 3.0, 1.5, 3.5, 2.0, 1.0, 0.5], // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
      totalHours: 24,
      peakDay: 'Thursday',
      peakHours: '18:00-20:00', // 6PM-8PM
      averageSessionLength: 45, // minutes
      averageDailyStudy: 1.7, // hours
      activityHeatmap: [
        // Format: [day, hour, intensity (0-3)]
        [0, 9, 0], [0, 10, 1], [0, 11, 0], [0, 12, 0], [0, 13, 0], [0, 14, 0], 
        [0, 15, 2], [0, 16, 3], [0, 17, 1], [0, 18, 0], [0, 19, 1], [0, 20, 0],
        [1, 9, 0], [1, 10, 0], [1, 11, 2], [1, 12, 1], [1, 13, 0], [1, 14, 0], 
        [1, 15, 0], [1, 16, 0], [1, 17, 0], [1, 18, 2], [1, 19, 3], [1, 20, 1],
        [2, 9, 0], [2, 10, 0], [2, 11, 0], [2, 12, 0], [2, 13, 1], [2, 14, 1], 
        [2, 15, 0], [2, 16, 0], [2, 17, 0], [2, 18, 0], [2, 19, 1], [2, 20, 2],
        [3, 9, 0], [3, 10, 2], [3, 11, 1], [3, 12, 0], [3, 13, 0], [3, 14, 0], 
        [3, 15, 0], [3, 16, 1], [3, 17, 2], [3, 18, 3], [3, 19, 2], [3, 20, 1],
        [4, 9, 1], [4, 10, 0], [4, 11, 0], [4, 12, 0], [4, 13, 1], [4, 14, 0], 
        [4, 15, 0], [4, 16, 0], [4, 17, 1], [4, 18, 2], [4, 19, 1], [4, 20, 0]
      ]
    };
  }

  getPlaceholderSkillCoverage() {
    return {
      skills: [
        { name: 'HTML', userScore: 85, courseAverage: 65 },
        { name: 'CSS', userScore: 75, courseAverage: 70 },
        { name: 'JavaScript', userScore: 60, courseAverage: 50 },
        { name: 'Responsive Design', userScore: 80, courseAverage: 75 },
        { name: 'APIs', userScore: 55, courseAverage: 60 },
        { name: 'Version Control', userScore: 70, courseAverage: 55 }
      ],
      strengths: ['HTML', 'Responsive Design'],
      areasForImprovement: ['JavaScript', 'APIs']
    };
  }

  getPlaceholderTopicMastery() {
    return {
      topics: [
        { name: 'HTML Basics', mastery: 85, importance: 15, position: 20 },
        { name: 'CSS Fundamentals', mastery: 82, importance: 12, position: 30 },
        { name: 'JavaScript Variables', mastery: 70, importance: 8, position: 40 },
        { name: 'Functions', mastery: 65, importance: 5, position: 50 },
        { name: 'DOM Manipulation', mastery: 60, importance: 7, position: 60 },
        { name: 'Responsive Design', mastery: 75, importance: 10, position: 70 },
        { name: 'APIs', mastery: 55, importance: 6, position: 80 }
      ]
    };
  }
}

// Create a singleton instance
const analyticsData = new AnalyticsDataService();

// Export the instance for use in other files
// Since we're not using ES modules, we'll make it available globally
window.analyticsData = analyticsData;