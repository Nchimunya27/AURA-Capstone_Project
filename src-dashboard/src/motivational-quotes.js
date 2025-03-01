// Motivational quotes system for analytics page
const motivationalQuotes = [
    {
      quote: "The expert in anything was once a beginner.",
      author: "Helen Hayes"
    },
    {
      quote: "Success is the sum of small efforts, repeated day in and day out.",
      author: "Robert Collier"
    },
    {
      quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
      author: "Dr. Seuss"
    },
    {
      quote: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
      author: "Malcolm X"
    },
    {
      quote: "Your streak is impressive! Learning consistently is the key to mastery.",
      author: "AURA Analytics"
    },
    {
      quote: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King"
    },
    {
      quote: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
      author: "Brian Herbert"
    },
    {
      quote: "Online learning is not the next big thing, it is the now big thing.",
      author: "Donna J. Abernathy"
    },
    {
      quote: "You're on your way to becoming a Web Development expert!",
      author: "AURA Analytics",
      tag: "web-development"
    },
    {
      quote: "The difference between ordinary and extraordinary is that little extra. Keep pushing!",
      author: "Jimmy Johnson"
    },
    {
      quote: "You don't have to be great to start, but you have to start to be great.",
      author: "Zig Ziglar"
    },
    {
      quote: "Your quiz performance puts you in the top percentile of students!",
      author: "AURA Analytics",
      condition: "averageScore > 85"
    },
    {
      quote: "A little progress each day adds up to big results.",
      author: "Satya Nani"
    },
    {
      quote: "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.",
      author: "Abigail Adams"
    },
    {
      quote: "The journey of a thousand miles begins with one step.",
      author: "Lao Tzu"
    }
  ];
  
  // Context-aware quotes based on user data
  const contextAwareQuotes = [
    {
      text: "You're on a {streakCount}-day streak! Just {daysToRecord} more days to beat your record!",
      condition: userdata => userdata.currentStreak > 7 && userdata.longestStreak - userdata.currentStreak <= 10
    },
    {
      text: "Your consistency is paying off! Your average quiz score has improved by {improvementPercent}% this month.",
      condition: userdata => userdata.scoreImprovement > 5
    },
    {
      text: "You're making great progress! You've completed {completedPercentage}% of the course.",
      condition: userdata => userdata.completedPercentage >= 50
    },
    {
      text: "You're in the final stretch! Just {remainingModules} modules to go!",
      condition: userdata => userdata.completedPercentage >= 75
    },
    {
      text: "Did you know? Your most productive day is {productiveDay}. You complete {productiveDayPercent}% more work on this day!",
      condition: userdata => userdata.hasProductivityData
    },
    {
      text: "Challenge: Can you reach a {targetStreak}-day streak? You're already {streakPercentage}% there!",
      condition: userdata => userdata.currentStreak > 0
    },
    {
      text: "Your most effective study time appears to be {peakStudyTime}. Consider scheduling important learning during this window!",
      condition: userdata => userdata.hasPeakStudyTime
    }
  ];
  
  // Function to get a random quote
  function getRandomQuote(userData = {}) {
    // Try to find a context-aware quote first
    const applicableContextQuotes = contextAwareQuotes.filter(item => {
      if (typeof item.condition === 'function') {
        return item.condition(userData);
      }
      return true;
    });
    
    // If we have applicable context quotes, use one of those
    if (applicableContextQuotes.length > 0) {
      const quote = applicableContextQuotes[Math.floor(Math.random() * applicableContextQuotes.length)];
      
      // Process template strings
      let text = quote.text;
      Object.keys(userData).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        text = text.replace(regex, userData[key]);
      });
      
      return {
        quote: text,
        author: "AURA Analytics",
        isContextual: true
      };
    }
    
    // Otherwise use a generic motivational quote
    const applicableQuotes = motivationalQuotes.filter(item => {
      // Filter by course if available
      if (userData.currentCourse && item.tag && item.tag !== userData.currentCourse) {
        return false;
      }
      
      // Filter by condition if available
      if (item.condition) {
        const conditionParts = item.condition.split(' ');
        const metric = conditionParts[0];
        const operator = conditionParts[1];
        const value = parseFloat(conditionParts[2]);
        
        if (userData[metric] !== undefined) {
          switch (operator) {
            case '>': return userData[metric] > value;
            case '<': return userData[metric] < value;
            case '>=': return userData[metric] >= value;
            case '<=': return userData[metric] <= value;
            case '==': return userData[metric] == value;
            default: return true;
          }
        }
      }
      
      return true;
    });
    
    // Return a random quote from filtered list, or a default if none match
    if (applicableQuotes.length > 0) {
      return applicableQuotes[Math.floor(Math.random() * applicableQuotes.length)];
    } else {
      return {
        quote: "Every day is a new opportunity to learn something new!",
        author: "AURA Learning"
      };
    }
  }
  
  // Function to display the quote in the UI
  function displayMotivationalQuote(userData = {}) {
    const quoteContainer = document.querySelector('.motivational-quote-container');
    if (!quoteContainer) return;
    
    const quote = getRandomQuote(userData);
    
    // Create quote elements
    quoteContainer.innerHTML = `
      <div class="quote-content">
        <div class="quote-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 11H6C5.46957 11 4.96086 10.7893 4.58579 10.4142C4.21071 10.0391 4 9.53043 4 9V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H8C8.53043 5 9.03914 5.21071 9.41421 5.58579C9.78929 5.96086 10 6.46957 10 7V16C10 17.0609 9.57857 18.0783 8.82843 18.8284C8.07828 19.5786 7.06087 20 6 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V18C4 17.7348 4.10536 17.4804 4.29289 17.2929C4.48043 17.1054 4.73478 17 5 17H6C6.26522 17 6.51957 16.8946 6.70711 16.7071C6.89464 16.5196 7 16.2652 7 16V13C7 12.7348 6.89464 12.4804 6.70711 12.2929C6.51957 12.1054 6.26522 12 6 12H5C4.73478 12 4.48043 11.8946 4.29289 11.7071C4.10536 11.5196 4 11.2652 4 11V10C4 9.73478 4.10536 9.48043 4.29289 9.29289C4.48043 9.10536 4.73478 9 5 9H6C6.26522 9 6.51957 8.89464 6.70711 8.70711C6.89464 8.51957 7 8.26522 7 8V7C7 6.73478 6.89464 6.48043 6.70711 6.29289C6.51957 6.10536 6.26522 6 6 6H5C4.73478 6 4.48043 6.10536 4.29289 6.29289C4.10536 6.48043 4 6.73478 4 7V9C4 9.26522 4.10536 9.51957 4.29289 9.70711C4.48043 9.89464 4.73478 10 5 10H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 11H16C15.4696 11 14.9609 10.7893 14.5858 10.4142C14.2107 10.0391 14 9.53043 14 9V7C14 6.46957 14.2107 5.96086 14.5858 5.58579C14.9609 5.21071 15.4696 5 16 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V16C20 17.0609 19.5786 18.0783 18.8284 18.8284C18.0783 19.5786 17.0609 20 16 20H15C14.7348 20 14.4804 19.8946 14.2929 19.7071C14.1054 19.5196 14 19.2652 14 19V18C14 17.7348 14.1054 17.4804 14.2929 17.2929C14.4804 17.1054 14.7348 17 15 17H16C16.2652 17 16.5196 16.8946 16.7071 16.7071C16.8946 16.5196 17 16.2652 17 16V13C17 12.7348 16.8946 12.4804 16.7071 12.2929C16.5196 12.1054 16.2652 12 16 12H15C14.7348 12 14.4804 11.8946 14.2929 11.7071C14.1054 11.5196 14 11.2652 14 11V10C14 9.73478 14.1054 9.48043 14.2929 9.29289C14.4804 9.10536 14.7348 9 15 9H16C16.2652 9 16.5196 8.89464 16.7071 8.70711C16.8946 8.51957 17 8.26522 17 8V7C17 6.73478 16.8946 6.48043 16.7071 6.29289C16.5196 6.10536 16.2652 6 16 6H15C14.7348 6 14.4804 6.10536 14.2929 6.29289C14.1054 6.48043 14 6.73478 14 7V9C14 9.26522 14.1054 9.51957 14.2929 9.70711C14.4804 9.89464 14.7348 10 15 10H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="quote-text">${quote.quote}</div>
        <div class="quote-author">— ${quote.author}</div>
      </div>
    `;
    
    // Add animation class
    quoteContainer.classList.add('quote-fade-in');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      quoteContainer.classList.remove('quote-fade-in');
    }, 1000);
  }
  
  // Update quote periodically or on tab change
  function initializeMotivationalQuotes() {
    // Display initial quote
    const userData = {
      currentStreak: 15,
      longestStreak: 32,
      completedPercentage: 75,
      remainingModules: 2,
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
    
    displayMotivationalQuote(userData);
    
    // Create a new quote when analytics tab is opened
    const analyticsButton = document.querySelector('[data-tab="overall-analytics"]');
    if (analyticsButton) {
      analyticsButton.addEventListener('click', () => {
        displayMotivationalQuote(userData);
      });
    }
    
    // Change quote every 60 seconds if the analytics tab is visible
    setInterval(() => {
      const analyticsSection = document.getElementById('overall-analytics');
      if (analyticsSection && analyticsSection.classList.contains('active')) {
        displayMotivationalQuote(userData);
      }
    }, 60000);
  }
  
  // Run initialization when DOM is ready
  document.addEventListener('DOMContentLoaded', initializeMotivationalQuotes);