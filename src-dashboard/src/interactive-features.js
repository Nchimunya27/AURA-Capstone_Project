// Combined implementation for AURA Dashboard Interactive Features
// Includes: Personalized Elements, Achievement & Stats Animations, Interactive Calendar, Animated Course Cards

document.addEventListener('DOMContentLoaded', function() {

    //=============================
    // 1. PERSONALIZED ELEMENTS
    //=============================
    function initializePersonalizedElements() {
      // Personalized greeting based on time of day
      const welcomeText = document.querySelector('.welcome-text');
      const currentDate = document.querySelector('.current-date');
      
      if (welcomeText && currentDate) {
        // Get current time
        const now = new Date();
        const hour = now.getHours();
        const username = localStorage.getItem('currentUsername') || 'User';
        
        // Set personalized greeting based on time of day
        let greeting = '';
        if (hour >= 5 && hour < 12) {
          greeting = `Good morning, ${username}!`;
        } else if (hour >= 12 && hour < 17) {
          greeting = `Good afternoon, ${username}!`;
        } else if (hour >= 17 && hour < 22) {
          greeting = `Good evening, ${username}!`;
        } else {
          greeting = `Working late, ${username}?`;
        }
        
        // Update welcome text with animation
        welcomeText.innerHTML = greeting;
        welcomeText.classList.add('animated');
        
        // Update current date with formatted display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDate.textContent = now.toLocaleDateString('en-US', options);
        
        // Add animated weather/mood icon based on preset or local conditions
        const weatherIcon = document.createElement('div');
        weatherIcon.className = 'weather-icon';
        
        // For demo we'll use a random weather, in production this would use an API
        const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy'];
        const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
        
        // Set icon based on weather
        switch (randomWeather) {
          case 'sunny':
            weatherIcon.innerHTML = '☀️';
            weatherIcon.title = 'Sunny Day';
            break;
          case 'cloudy':
            weatherIcon.innerHTML = '☁️';
            weatherIcon.title = 'Cloudy Day';
            break;
          case 'rainy':
            weatherIcon.innerHTML = '🌧️';
            weatherIcon.title = 'Rainy Day';
            break;
          case 'snowy':
            weatherIcon.innerHTML = '❄️';
            weatherIcon.title = 'Snowy Day';
            break;
        }
        
        // Add weather icon to header
        document.querySelector('.welcome-section').appendChild(weatherIcon);
      }
      
      // Streak visualization
      const streakBadge = document.querySelector('.streak-badge');
      if (streakBadge) {
        // Get actual streak count (for demo purposes we'll use 5)
        const streakCount = 5;
        const streakCountElement = streakBadge.querySelector('.streak-count');
        
        if (streakCountElement) {
          // Animate the streak count
          let displayCount = 0;
          const countInterval = setInterval(() => {
            displayCount++;
            streakCountElement.textContent = `${displayCount} Days`;
            
            if (displayCount >= streakCount) {
              clearInterval(countInterval);
              
              // Add encouraging message after count finishes
              setTimeout(() => {
                const streakMessage = document.createElement('div');
                streakMessage.className = 'streak-message';
                streakMessage.textContent = streakCount >= 7 ? 'Impressive streak!' : 'Keep it up!';
                streakBadge.appendChild(streakMessage);
                
                // Animate the message
                setTimeout(() => {
                  streakMessage.style.opacity = '1';
                  streakMessage.style.transform = 'translateY(0)';
                }, 10);
              }, 500);
            }
          }, 200);
        }
        
        // Make streak interactive
        streakBadge.addEventListener('click', function() {
          showStreakHistory();
        });
      }
    }
  
    // Show streak history modal
    function showStreakHistory() {
      // Create sample streak data
      const streakData = [
        { date: '2025-01-08', studyTime: 2.5 },
        { date: '2025-01-09', studyTime: 1.8 },
        { date: '2025-01-10', studyTime: 3.2 },
        { date: '2025-01-11', studyTime: 2.0 },
        { date: '2025-01-12', studyTime: 4.5 },
      ];
      
      const modal = document.createElement('div');
      modal.className = 'streak-modal';
      modal.innerHTML = `
        <div class="streak-modal-content">
          <span class="close-modal">&times;</span>
          <h2>Your Learning Streak</h2>
          <div class="streak-summary">
            <div class="current-streak">
              <span class="streak-value">5</span>
              <span class="streak-label">Current Streak</span>
            </div>
            <div class="longest-streak">
              <span class="streak-value">12</span>
              <span class="streak-label">Longest Streak</span>
            </div>
            <div class="total-days">
              <span class="streak-value">28</span>
              <span class="streak-label">Total Days</span>
            </div>
          </div>
          <div class="streak-visualization">
            <h3>Last 30 Days</h3>
            <div class="streak-calendar"></div>
          </div>
          <div class="streak-chart-container">
            <h3>Study Time</h3>
            <canvas id="streakChart"></canvas>
          </div>
          <div class="streak-tips">
            <h3>Maintain Your Streak</h3>
            <ul>
              <li>Study for at least 30 minutes daily</li>
              <li>Complete at least one learning activity</li>
              <li>Log in before midnight to keep your streak alive</li>
            </ul>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Create streak calendar
      const streakCalendar = modal.querySelector('.streak-calendar');
      createStreakCalendar(streakCalendar);
      
      // Show the modal with animation
      setTimeout(() => {
        modal.style.opacity = '1';
      }, 10);
      
      // Add close functionality
      modal.querySelector('.close-modal').addEventListener('click', () => {
        closeModal(modal);
      });
      
      // Close when clicking outside the modal content
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
      
      // Create streak study time chart
      setTimeout(() => {
        const ctx = document.getElementById('streakChart').getContext('2d');
        createStreakChart(ctx, streakData);
      }, 100);
    }
    
    // Create streak calendar visualization
    function createStreakCalendar(container) {
      // Get dates for the last 30 days
      const today = new Date();
      const dates = Array.from({length: 30}, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (29 - i));
        return date;
      });
      
      // Sample active dates (in a real app, this would come from user data)
      const activeDates = [
        '2025-01-08', '2025-01-09', '2025-01-10', '2025-01-11', '2025-01-12',
        '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06',
        '2025-01-15', '2025-01-17', '2025-01-18', '2025-01-20', '2025-01-22'
      ];
      
      // Create calendar grid
      const calendarGrid = document.createElement('div');
      calendarGrid.className = 'streak-calendar-grid';
      
      dates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dateBox = document.createElement('div');
        dateBox.className = 'streak-date-box';
        
        // Check if this date is active
        if (activeDates.includes(dateStr)) {
          dateBox.classList.add('active');
          
          // Add different intensity based on activity level
          const randomIntensity = Math.floor(Math.random() * 4) + 1;
          dateBox.classList.add(`intensity-${randomIntensity}`);
        }
        
        // Show date on hover
        dateBox.title = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Add tooltip with more details
        dateBox.addEventListener('mouseenter', function(e) {
          const tooltip = document.createElement('div');
          tooltip.className = 'streak-tooltip';
          
          if (activeDates.includes(dateStr)) {
            const hours = (Math.random() * 4 + 1).toFixed(1);
            tooltip.innerHTML = `
              <div class="tooltip-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <div class="tooltip-time">${hours} hours studied</div>
            `;
          } else {
            tooltip.innerHTML = `
              <div class="tooltip-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              <div class="tooltip-time">No activity</div>
            `;
          }
          
          document.body.appendChild(tooltip);
          
          const rect = dateBox.getBoundingClientRect();
          tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
          tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
          
          setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
          }, 10);
          
          dateBox.tooltip = tooltip;
        });
        
        dateBox.addEventListener('mouseleave', function() {
          if (dateBox.tooltip) {
            dateBox.tooltip.style.opacity = '0';
            dateBox.tooltip.style.transform = 'translateY(5px)';
            
            setTimeout(() => {
              if (dateBox.tooltip && dateBox.tooltip.parentNode) {
                document.body.removeChild(dateBox.tooltip);
                dateBox.tooltip = null;
              }
            }, 300);
          }
        });
        
        calendarGrid.appendChild(dateBox);
      });
      
      container.appendChild(calendarGrid);
    }
    
    // Create streak chart
    function createStreakChart(ctx, data) {
      // Transform data for the chart
      const labels = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const studyTimes = data.map(item => item.studyTime);
      
      // Draw simple bar chart
      const canvas = ctx.canvas;
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width - 60) / data.length;
      const maxTime = Math.max(...studyTimes) * 1.2;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.lineTo(30, height - 30);
      ctx.lineTo(width - 30, height - 30);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      
      // Draw bars
      data.forEach((item, index) => {
        const barHeight = (item.studyTime / maxTime) * (height - 70);
        const x = 40 + (index * barWidth);
        const y = height - 30 - barHeight;
        
        // Draw bar
        ctx.fillStyle = 'rgba(74, 108, 247, 0.7)';
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        // Add label
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + (barWidth - 10) / 2, height - 10);
        
        // Add value
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${item.studyTime}h`, x + (barWidth - 10) / 2, y - 5);
      });
      
      // Animate the chart (simple fade-in)
      canvas.style.opacity = 0;
      setTimeout(() => {
        canvas.style.transition = 'opacity 1s ease';
        canvas.style.opacity = 1;
      }, 100);
    }
  
    //=============================
    // 2. ACHIEVEMENT & STATS ANIMATIONS
    //=============================
    function initializeAchievementsAndStats() {
      // Sample achievements data
      const achievements = [
        { id: 1, title: 'First Course Completed', icon: '🏆', description: 'Completed your first course', unlocked: true, date: '2024-12-15', xp: 50 },
        { id: 2, title: 'Perfect Score', icon: '⭐', description: 'Got 100% on an assessment', unlocked: true, date: '2025-01-05', xp: 100 },
        { id: 3, title: 'Study Streak', icon: '🔥', description: 'Logged in for 7 consecutive days', unlocked: false, progress: 5, progressMax: 7, xp: 75 },
        { id: 4, title: 'Night Owl', icon: '🦉', description: 'Studied after 10pm for 5 days', unlocked: false, progress: 3, progressMax: 5, xp: 60 },
        { id: 5, title: 'Subject Master', icon: '🧠', description: 'Complete all courses in a subject', unlocked: false, progress: 2, progressMax: 3, xp: 150 }
      ];
      
      // Sample stats data
      const stats = [
        { id: 1, title: 'Courses Completed', value: 2, icon: '📚', trend: 'up', change: '+1 this month' },
        { id: 2, title: 'Study Hours', value: 32.5, icon: '⏱️', trend: 'up', change: '+8.5 this week' },
        { id: 3, title: 'Average Score', value: 87, icon: '📊', trend: 'up', change: '+3% improvement' },
        { id: 4, title: 'Current Streak', value: 5, icon: '🔥', trend: 'down', change: 'Missing yesterday' }
      ];
      
      // Initialize achievements section
      const achievementsList = document.querySelector('.achievements-list');
      if (achievementsList) {
        // Clear existing content
        achievementsList.innerHTML = '';
        
        // Create achievement header with toggle and XP total
        const totalXP = achievements
          .filter(a => a.unlocked)
          .reduce((sum, a) => sum + a.xp, 0);
        
        const achievementHeader = document.createElement('div');
        achievementHeader.className = 'achievements-header';
        achievementHeader.innerHTML = `
          <div class="achievements-toggle">
            <button class="toggle-btn active" data-filter="all">All</button>
            <button class="toggle-btn" data-filter="unlocked">Unlocked</button>
            <button class="toggle-btn" data-filter="locked">In Progress</button>
          </div>
          <div class="achievement-xp">
            <span class="xp-icon">✨</span>
            <span class="xp-count">${totalXP} XP</span>
          </div>
        `;
        achievementsList.appendChild(achievementHeader);
        
        // Create achievements container
        const achievementsContainer = document.createElement('div');
        achievementsContainer.className = 'achievements-container';
        achievementsList.appendChild(achievementsContainer);
        
        // Render achievements with filtering function
        function renderAchievements(filter = 'all') {
          achievementsContainer.innerHTML = '';
          
          const filteredAchievements = achievements.filter(achievement => {
            if (filter === 'all') return true;
            if (filter === 'unlocked') return achievement.unlocked;
            if (filter === 'locked') return !achievement.unlocked;
            return true;
          });
          
          filteredAchievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementElement.dataset.id = achievement.id;
            
            if (achievement.unlocked) {
              achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-content">
                  <div class="achievement-title">${achievement.title}</div>
                  <div class="achievement-info">${achievement.description}</div>
                  <div class="achievement-date">Unlocked: ${formatDate(achievement.date)}</div>
                </div>
                <div class="achievement-xp-badge">${achievement.xp} XP</div>
              `;
            } else {
              achievementElement.innerHTML = `
                <div class="achievement-icon locked">${achievement.icon}</div>
                <div class="achievement-content">
                  <div class="achievement-title">${achievement.title}</div>
                  <div class="achievement-info">${achievement.description}</div>
                  <div class="achievement-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${(achievement.progress / achievement.progressMax) * 100}%"></div>
                    </div>
                    <div class="progress-text">${achievement.progress}/${achievement.progressMax}</div>
                  </div>
                </div>
                <div class="achievement-xp-badge locked">${achievement.xp} XP</div>
              `;
            }
            
            // Add hover effect for more details
            achievementElement.addEventListener('mouseenter', function() {
              this.classList.add('hovered');
            });
            
            achievementElement.addEventListener('mouseleave', function() {
              this.classList.remove('hovered');
            });
            
            // Add click handler to show details
            achievementElement.addEventListener('click', function() {
              showAchievementDetails(achievement);
            });
            
            achievementsContainer.appendChild(achievementElement);
          });
          
          // If no achievements match filter
          if (filteredAchievements.length === 0) {
            achievementsContainer.innerHTML = `
              <div class="no-achievements">
                <p>No achievements to show</p>
              </div>
            `;
          }
          
          // Add animation to achievement cards
          animateAchievementEntrance();
        }
        
        // Initialize with all achievements
        renderAchievements();
        
        // Add filter button event listeners
        const filterButtons = achievementHeader.querySelectorAll('.toggle-btn');
        filterButtons.forEach(btn => {
          btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderAchievements(this.dataset.filter);
          });
        });
      }
      
      // Initialize stats section
      const statsGrid = document.querySelector('.stats-grid');
      if (statsGrid) {
        // Clear existing content
        statsGrid.innerHTML = '';
        
        // Create stats toggle header
        const statsHeader = document.createElement('div');
        statsHeader.className = 'stats-header';
        statsHeader.innerHTML = `
          <div class="stats-toggle">
            <button class="stats-period-btn active" data-period="week">Week</button>
            <button class="stats-period-btn" data-period="month">Month</button>
            <button class="stats-period-btn" data-period="all">All Time</button>
          </div>
        `;
        statsGrid.appendChild(statsHeader);
        
        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        statsGrid.appendChild(statsContainer);
        
        // Render stats
        function renderStats(period = 'week') {
          statsContainer.innerHTML = '';
          
          // In a real app, you'd filter stats based on the period
          // For now, we'll use the same data regardless of period
          
          stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = `stat-card trend-${stat.trend}`;
            statElement.dataset.id = stat.id;
            statElement.innerHTML = `
              <div class="stat-icon">${stat.icon}</div>
              <div class="stat-content">
                <div class="stat-title">${stat.title}</div>
                <div class="stat-value" data-value="${stat.value}">${stat.value}</div>
                <div class="stat-trend">
                  <span class="trend-icon">${stat.trend === 'up' ? '↑' : '↓'}</span>
                  <span class="trend-text">${stat.change}</span>
                </div>
              </div>
            `;
            
            // Add hover effect
            statElement.addEventListener('mouseenter', function() {
              this.classList.add('hovered');
            });
            
            statElement.addEventListener('mouseleave', function() {
              this.classList.remove('hovered');
            });
            
            // Add click handler to show detailed chart
            statElement.addEventListener('click', function() {
              showStatDetails(stat, period);
            });
            
            statsContainer.appendChild(statElement);
          });
          
          // Animate the number counters
          animateNumberCounters();
        }
        
        // Initialize with weekly stats
        renderStats();
        
        // Add period button event listeners
        const periodButtons = statsHeader.querySelectorAll('.stats-period-btn');
        periodButtons.forEach(btn => {
          btn.addEventListener('click', function() {
            periodButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderStats(this.dataset.period);
          });
        });
      }
    }
  
    // Function to animate number counters
    function animateNumberCounters() {
      const statValues = document.querySelectorAll('.stat-value');
      
      statValues.forEach(statValue => {
        const targetValue = parseFloat(statValue.dataset.value);
        const decimalPlaces = String(targetValue).includes('.') ? 
                            String(targetValue).split('.')[1].length : 0;
        
        // Reset to zero for animation
        let startValue = 0;
        statValue.textContent = decimalPlaces > 0 ? startValue.toFixed(decimalPlaces) : startValue;
        
        // Animate to target value
        const duration = 1500; // milliseconds
        const frameRate = 60;
        const increment = targetValue / (duration / 1000 * frameRate);
        
        let currentValue = startValue;
        const counterInterval = setInterval(() => {
          currentValue += increment;
          
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(counterInterval);
          }
          
          statValue.textContent = decimalPlaces > 0 ? 
                                currentValue.toFixed(decimalPlaces) : 
                                Math.floor(currentValue);
        }, 1000 / frameRate);
      });
    }
  
    // Function to animate achievement entrance
    function animateAchievementEntrance() {
      const achievements = document.querySelectorAll('.achievement');
      achievements.forEach((achievement, index) => {
        setTimeout(() => {
          achievement.style.opacity = '1';
          achievement.style.transform = 'translateY(0)';
        }, 100 * index);
      });
    }
  
    // Function to show achievement details
    function showAchievementDetails(achievement) {
      const modal = document.createElement('div');
      modal.className = 'achievement-modal';
      
      if (achievement.unlocked) {
        modal.innerHTML = `
          <div class="achievement-modal-content ${achievement.unlocked ? 'unlocked' : 'locked'}">
            <span class="close-modal">&times;</span>
            <div class="achievement-detail-header">
              <div class="achievement-large-icon">${achievement.icon}</div>
              <h2>${achievement.title}</h2>
              <div class="achievement-xp-large">${achievement.xp} XP</div>
            </div>
            <div class="achievement-detail-body">
              <p>${achievement.description}</p>
              <p class="achievement-unlock-date">Unlocked on ${formatDate(achievement.date)}</p>
            </div>
            <div class="achievement-share">
              <button class="share-achievement-btn">Share Achievement</button>
            </div>
          </div>
        `;
      } else {
        modal.innerHTML = `
          <div class="achievement-modal-content locked">
            <span class="close-modal">&times;</span>
            <div class="achievement-detail-header">
              <div class="achievement-large-icon locked">${achievement.icon}</div>
              <h2>${achievement.title}</h2>
              <div class="achievement-xp-large locked">${achievement.xp} XP</div>
            </div>
            <div class="achievement-detail-body">
              <p>${achievement.description}</p>
              <div class="achievement-progress-detail">
                <div class="progress-bar-large">
                  <div class="progress-fill" style="width: ${(achievement.progress / achievement.progressMax) * 100}%"></div>
                </div>
                <div class="progress-text-large">${achievement.progress}/${achievement.progressMax} Complete</div>
              </div>
              <p class="achievement-tips">How to earn: ${getTips(achievement)}</p>
            </div>
          </div>
        `;
      }
      
      document.body.appendChild(modal);
      
      // Show the modal with animation
      setTimeout(() => {
        modal.style.opacity = '1';
      }, 10);
      
      // Add close functionality
      modal.querySelector('.close-modal').addEventListener('click', () => {
        closeModal(modal);
      });
      
      // Close when clicking outside the modal content
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
      
      // Add share button functionality if unlocked
      if (achievement.unlocked) {
        modal.querySelector('.share-achievement-btn').addEventListener('click', function() {
          // Simulate sharing with toast notification
          const toast = document.createElement('div');
          toast.className = 'toast-notification';
          toast.innerHTML = `Achievement shared to your profile!`;
          document.body.appendChild(toast);
          
          setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
          }, 10);
          
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => {
              document.body.removeChild(toast);
            }, 300);
          }, 3000);
        });
      }
    }
  
    // Function to show stat details with chart
    function showStatDetails(stat, period) {
      // Generate mock chart data based on the stat and period
      const chartData = generateMockChartData(stat, period);
      
      const modal = document.createElement('div');
      modal.className = 'stat-modal';
      modal.innerHTML = `
        <div class="stat-modal-content">
          <span class="close-modal">&times;</span>
          <div class="stat-detail-header">
            <div class="stat-large-icon">${stat.icon}</div>
            <h2>${stat.title}</h2>
            <div class="stat-period-label">${capitalize(period)}ly Overview</div>
          </div>
          <div class="stat-chart-container">
            <canvas id="statChart"></canvas>
          </div>
          <div class="stat-insights">
            <h3>Insights</h3>
            <p>${generateInsights(stat, period)}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Show the modal with animation
      setTimeout(() => {
        modal.style.opacity = '1';
      }, 10);
      
      // Create the chart using mock data
      setTimeout(() => {
        const ctx = document.getElementById('statChart').getContext('2d');
        createStatChart(ctx, chartData);
      }, 100);
      
      // Add close functionality
      modal.querySelector('.close-modal').addEventListener('click', () => {
        closeModal(modal);
      });
      
      // Close when clicking outside the modal content
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  
    // Helper function to generate mock chart data
    function generateMockChartData(stat, period) {
      let labels = [];
      let values = [];
      const value = stat.value;
      
      if (period === 'week') {
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        values = generateRandomSeriesAroundValue(value, 7);
      } else if (period === 'month') {
        labels = Array.from({length: 4}, (_, i) => `Week ${i+1}`);
        values = generateRandomSeriesAroundValue(value, 4);
      } else if (period === 'all') {
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        values = generateRandomSeriesAroundValue(value, 12);
      }
      
      return { labels, values };
    }
  
    // Create stat chart
    function createStatChart(ctx, data) {
      const canvas = ctx.canvas;
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = (width - 60) / data.values.length;
      const maxValue = Math.max(...data.values) * 1.2;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw axes
      ctx.beginPath();
      ctx.moveTo(30, 30);
      ctx.lineTo(30, height - 30);
      ctx.lineTo(width - 30, height - 30);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      
      // Draw bars with animation
      data.values.forEach((value, index) => {
        setTimeout(() => {
          const barHeight = (value / maxValue) * (height - 70);
          const x = 40 + (index * barWidth);
          const y = height - 30 - barHeight;
          
          // Draw bar with animation
          const animateBar = (currentHeight) => {
            // Clear previous state
            ctx.clearRect(x, height - 30 - currentHeight, barWidth - 10, currentHeight);
            
            // Draw bar
            ctx.fillStyle = 'rgba(74, 108, 247, 0.7)';
            ctx.fillRect(x, height - 30 - currentHeight, barWidth - 10, currentHeight);
            
            // Add value
            if (currentHeight === barHeight) {
              ctx.fillStyle = '#333';
              ctx.font = '12px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(value.toFixed(1), x + (barWidth - 10) / 2, y - 5);
            }
            
            if (currentHeight < barHeight) {
              requestAnimationFrame(() => animateBar(Math.min(currentHeight + barHeight / 20, barHeight)));
            }
          };
          
          animateBar(0);
          
          // Add label
          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(data.labels[index], x + (barWidth - 10) / 2, height - 10);
        }, index * 100);
      });
    }
  
    // Helper function to generate random values around a target
    function generateRandomSeriesAroundValue(value, length) {
      const variation = value * 0.3; // 30% variation
      
      return Array.from({length}, () => {
        const randomVariation = (Math.random() * variation * 2) - variation;
        return Math.max(0, value + randomVariation);
      });
    }
  
    // Helper function to generate insights
    function generateInsights(stat, period) {
      const insights = {
        'Courses Completed': {
          week: 'You completed 1 course this week, which is ahead of your weekly goal.',
          month: 'Youve completed 2 courses this month, putting you on track to meet your semester goal.',
          all: 'Youve completed 8 courses in total since joining, which is impressive progress!'
        },
        'Study Hours': {
          week: 'You studied for 32.5 hours this week, which is 8.5 hours more than last week.',
          month: 'Your monthly study time has increased by 15% compared to last month.',
          all: 'Your average weekly study time is 28.3 hours, which is consistent with successful students.'
        },
        'Average Score': {
          week: 'Your scores are improving! Youre up 3% from last week.',
          month: 'Youve maintained a strong average above 85% all month.',
          all: 'Your score trend shows consistent improvement over time.'
        },
        'Current Streak': {
          week: 'You missed a day yesterday. Try to log in today to rebuild your streak!',
          month: 'Your longest streak this month was 12 days.',
          all: 'Your all-time best streak is 15 days. Can you beat that?'
        }
      };
      
      return insights[stat.title]?.[period] || 
             'Keep up the good work to see more detailed insights over time.';
    }
    
    // Helper function to get achievement tips
    function getTips(achievement) {
      switch(achievement.title) {
        case 'Study Streak':
          return 'Log in daily to continue your streak. Current streak: 5 days';
        case 'Night Owl':
          return 'Complete study sessions after 10pm';
        case 'Subject Master':
          return 'Complete 1 more course in the UX Design subject';
        default:
          return 'Continue engaging with the platform to unlock this achievement';
      }
    }
  
    //=============================
    // 3. INTERACTIVE CALENDAR
    //=============================
    function initializeInteractiveCalendar() {
      // Sample events data
      const events = [
        { id: 1, title: 'UX Design Midterm', date: '2025-01-20', course: 'Introduction to UX Design', type: 'exam', time: '10:00 AM', location: 'Room 302', description: 'Covers chapters 1-5' },
        { id: 2, title: 'ML Project Due', date: '2025-01-25', course: 'Machine Learning Fundamentals', type: 'assignment', time: '11:59 PM', location: 'Online Submission', description: 'Final project submission' },
        { id: 3, title: 'JavaScript Final', date: '2025-02-15', course: 'Advanced JavaScript', type: 'exam', time: '2:00 PM', location: 'Main Hall', description: 'Comprehensive exam' }
      ];
      
      // Current date tracking
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth();
      let currentYear = currentDate.getFullYear();
      
      // Get calendar elements
      const calendarMonthYear = document.querySelector('.calendar-month-year');
      const calendarDays = document.querySelector('.calendar-days');
      const prevMonthBtn = document.querySelector('.prev-month');
      const nextMonthBtn = document.querySelector('.next-month');
      const eventDetails = document.querySelector('.event-details');
      
      // Calendar header with view options
      const calendarHeader = document.querySelector('.calendar-header');
      if (calendarHeader) {
        const viewOptions = document.createElement('div');
        viewOptions.className = 'calendar-view-options';
        viewOptions.innerHTML = `
          <button class="view-btn active" data-view="month">Month</button>
          <button class="view-btn" data-view="week">Week</button>
          <button class="view-btn" data-view="day">Day</button>
          <button class="add-event-btn">+ Event</button>
        `;
        calendarHeader.appendChild(viewOptions);
        
        // Set up view buttons
        const viewButtons = viewOptions.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
          btn.addEventListener('click', function() {
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderCalendar(currentMonth, currentYear, this.dataset.view);
          });
        });
        
        // Add event button
        viewOptions.querySelector('.add-event-btn').addEventListener('click', function() {
          showEventModal();
        });
      }
      
      // Initialize event listeners
      if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
          currentMonth--;
          if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
          }
          renderCalendar(currentMonth, currentYear);
        });
      }
      
      if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
          currentMonth++;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
          renderCalendar(currentMonth, currentYear);
        });
      }
      
      // Render the calendar
      function renderCalendar(month, year, view = 'month') {
        // Set the month and year text
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (calendarMonthYear) {
          calendarMonthYear.textContent = `${monthNames[month]} ${year}`;
        }
        
        if (view === 'month') {
          renderMonthView(month, year);
        } else if (view === 'week') {
          renderWeekView(month, year);
        } else if (view === 'day') {
          renderDayView(month, year);
        }
      }
      
      // Render month view
      function renderMonthView(month, year) {
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        // First day of the month
        const firstDay = new Date(year, month, 1).getDay();
        
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0).getDate();
        
        // Last day of the previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        // Create days from previous month
        for (let i = firstDay - 1; i >= 0; i--) {
          const day = document.createElement('div');
          day.className = 'day prev-month-day';
          day.textContent = prevMonthLastDay - i;
          calendarDays.appendChild(day);
        }
        
        // Create days for current month with animation
        for (let i = 1; i <= lastDay; i++) {
          const day = document.createElement('div');
          day.className = 'day';
          day.textContent = i;
          day.style.opacity = '0';
          day.style.transform = 'scale(0.8)';
          
          // Check if the day has events
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const dayEvents = events.filter(event => event.date === dateString);
          
          if (dayEvents.length > 0) {
            day.classList.add('has-events');
            
            // Add event indicators
            const eventIndicators = document.createElement('div');
            eventIndicators.className = 'event-indicators';
            
            // Group by event type and add color-coded indicators
            const eventTypes = [...new Set(dayEvents.map(event => event.type))];
            eventTypes.forEach(type => {
              const indicator = document.createElement('div');
              indicator.className = `event-indicator ${type}`;
              eventIndicators.appendChild(indicator);
            });
            
            day.appendChild(eventIndicators);
            
            // Add event count if more than one
            if (dayEvents.length > 1) {
              const eventCount = document.createElement('div');
              eventCount.className = 'event-count';
              eventCount.textContent = dayEvents.length;
              day.appendChild(eventCount);
            }
            
            // Add click event to show details
            day.addEventListener('click', function() {
              showDayEvents(dayEvents, i, monthNames[month], year);
            });
          } else {
            // Add click event for adding new events
            day.addEventListener('click', function() {
              showEventModal(dateString);
            });
          }
          
          // Highlight today
          const today = new Date();
          if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            day.classList.add('today');
          }
          
          calendarDays.appendChild(day);
          
          // Animate day appearance with a staggered delay
          setTimeout(() => {
            day.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            day.style.opacity = '1';
            day.style.transform = 'scale(1)';
          }, i * 20);
        }
        
        // Calculate number of days to fill in from next month
        const totalDaysDisplayed = calendarDays.children.length;
        const remainingCells = 42 - totalDaysDisplayed; // 6 rows * 7 days = 42
        
        // Add days from next month to complete the grid
        for (let i = 1; i <= remainingCells; i++) {
          const day = document.createElement('div');
          day.className = 'day next-month-day';
          day.textContent = i;
          calendarDays.appendChild(day);
        }
      }
      
      // Render week view
      function renderWeekView(month, year) {
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        // Get current week starting from Sunday
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        
        // Create week header
        const weekHeader = document.createElement('div');
        weekHeader.className = 'week-header';
        calendarDays.appendChild(weekHeader);
        
        // Create week grid
        const weekGrid = document.createElement('div');
        weekGrid.className = 'week-grid';
        calendarDays.appendChild(weekGrid);
        
        // Add hours column
        const hoursColumn = document.createElement('div');
        hoursColumn.className = 'hours-column';
        
        for (let hour = 8; hour < 20; hour++) {
          const hourCell = document.createElement('div');
          hourCell.className = 'hour-cell';
          hourCell.textContent = `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'AM' : 'PM'}`;
          hoursColumn.appendChild(hourCell);
        }
        
        weekGrid.appendChild(hoursColumn);
        
        // Add day columns
        for (let i = 0; i < 7; i++) {
          const currentDay = new Date(weekStart);
          currentDay.setDate(weekStart.getDate() + i);
          
          // Add day header
          const dayHeader = document.createElement('div');
          dayHeader.className = 'day-header';
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
          const dayDate = currentDay.getDate();
          dayHeader.textContent = `${dayName} ${dayDate}`;
          
          // Highlight today
          if (currentDay.toDateString() === today.toDateString()) {
            dayHeader.classList.add('today');
          }
          
          weekHeader.appendChild(dayHeader);
          
          // Add day column
          const dayColumn = document.createElement('div');
          dayColumn.className = 'day-column';
          
          // Format date string for event comparison
          const dateString = currentDay.toISOString().split('T')[0];
          
          // Add hour cells for this day
          for (let hour = 8; hour < 20; hour++) {
            const hourCell = document.createElement('div');
            hourCell.className = 'hour-cell';
            
            // Check for events in this hour
            const hourEvents = events.filter(event => {
              if (event.date !== dateString) return false;
              
              const eventHour = parseInt(event.time.split(':')[0]) + 
                              (event.time.includes('PM') && !event.time.startsWith('12') ? 12 : 0);
              
              return eventHour === hour;
            });
            
            if (hourEvents.length > 0) {
              hourCell.classList.add('has-events');
              
              hourEvents.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = `event-item ${event.type}`;
                eventElement.textContent = event.title;
                eventElement.addEventListener('click', (e) => {
                  e.stopPropagation();
                  showEventDetails(event);
                });
                hourCell.appendChild(eventElement);
              });
            } else {
              // Allow adding events by clicking empty cells
              hourCell.addEventListener('click', () => {
                const newTime = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
                showEventModal(dateString, newTime);
              });
            }
            
            dayColumn.appendChild(hourCell);
          }
          
          weekGrid.appendChild(dayColumn);
        }
      }
      
      // Render day view
      function renderDayView(month, year) {
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        // Get current date
        const selectedDate = new Date(year, month, currentDate.getDate());
        const dateString = selectedDate.toISOString().split('T')[0];
        
        // Create day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-view-header';
        dayHeader.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        calendarDays.appendChild(dayHeader);
        
        // Create day schedule
        const daySchedule = document.createElement('div');
        daySchedule.className = 'day-schedule';
        
        // Add hours
        for (let hour = 8; hour < 22; hour++) {
          const hourRow = document.createElement('div');
          hourRow.className = 'hour-row';
          
          // Hour label
          const hourLabel = document.createElement('div');
          hourLabel.className = 'hour-label';
          hourLabel.textContent = `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'AM' : 'PM'}`;
          hourRow.appendChild(hourLabel);
          
          // Hour content
          const hourContent = document.createElement('div');
          hourContent.className = 'hour-content';
          
          // Check for events in this hour
          const hourEvents = events.filter(event => {
            if (event.date !== dateString) return false;
            
            const eventHour = parseInt(event.time.split(':')[0]) + 
                            (event.time.includes('PM') && !event.time.startsWith('12') ? 12 : 0);
            
            return eventHour === hour;
          });
          
          if (hourEvents.length > 0) {
            hourEvents.forEach(event => {
              const eventElement = document.createElement('div');
              eventElement.className = `day-event-item ${event.type}`;
              eventElement.innerHTML = `
                <div class="event-time">${event.time}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-location">${event.location}</div>
              `;
              eventElement.addEventListener('click', () => {
                showEventDetails(event);
              });
              hourContent.appendChild(eventElement);
            });
          } else {
            // Allow adding events by clicking empty cells
            hourContent.addEventListener('click', () => {
              const newTime = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
              showEventModal(dateString, newTime);
            });
          }
          
          hourRow.appendChild(hourContent);
          daySchedule.appendChild(hourRow);
        }
        
        calendarDays.appendChild(daySchedule);
      }
      
      // Show events for a specific day
      function showDayEvents(dayEvents, day, month, year) {
        if (!eventDetails) return;
        
        eventDetails.innerHTML = '';
        eventDetails.classList.remove('hidden');
        
        // Create event details header
        const header = document.createElement('div');
        header.className = 'event-details-header';
        header.innerHTML = `
          <h3>Events for ${month} ${day}, ${year}</h3>
          <button class="close-events">&times;</button>
          <button class="add-event-btn">+ Add Event</button>
        `;
        eventDetails.appendChild(header);
        
        // Add close button functionality
        header.querySelector('.close-events').addEventListener('click', function() {
          eventDetails.classList.add('hidden');
        });
        
        // Add event button functionality
        const dateString = `${year}-${String(new Date().getMonth(month) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        header.querySelector('.add-event-btn').addEventListener('click', function() {
          showEventModal(dateString);
        });
        
        // Create events list
        const eventsList = document.createElement('div');
        eventsList.className = 'day-events-list';
        
        // Sort events by time
        dayEvents.sort((a, b) => {
          const timeA = parseTime(a.time);
          const timeB = parseTime(b.time);
          return timeA - timeB;
        });
        
        // Add each event with animation
        dayEvents.forEach((event, index) => {
          const eventItem = document.createElement('div');
          eventItem.className = `event-item ${event.type}`;
          eventItem.style.opacity = '0';
          eventItem.style.transform = 'translateY(10px)';
          
          eventItem.innerHTML = `
            <div class="event-time">${event.time}</div>
            <div class="event-content">
              <div class="event-title">${event.title}</div>
              <div class="event-course">${event.course}</div>
              <div class="event-location">${event.location}</div>
            </div>
            <div class="event-actions">
              <button class="edit-event-btn" title="Edit Event">✏️</button>
              <button class="delete-event-btn" title="Delete Event">🗑️</button>
            </div>
          `;
          
          // Add click handler to show full details
          eventItem.addEventListener('click', function(e) {
            if (!e.target.closest('.event-actions')) {
              showEventDetails(event);
            }
          });
          
          // Add edit button handler
          eventItem.querySelector('.edit-event-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            showEventModal(null, null, event);
          });
          
          // Add delete button handler
          eventItem.querySelector('.delete-event-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
              const eventIndex = events.findIndex(e => e.id === event.id);
              if (eventIndex !== -1) {
                events.splice(eventIndex, 1);
                showDayEvents(events.filter(e => e.date === dateString), day, month, year);
                renderCalendar(currentMonth, currentYear);
              }
            }
          });
          
          eventsList.appendChild(eventItem);
          
          // Animate item appearance
          setTimeout(() => {
            eventItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            eventItem.style.opacity = '1';
            eventItem.style.transform = 'translateY(0)';
          }, index * 100);
        });
        
        eventDetails.appendChild(eventsList);
      }
      
      // Show detailed event information
      function showEventDetails(event) {
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        modal.innerHTML = `
          <div class="event-modal-content">
            <span class="close-modal">&times;</span>
            <div class="event-type-badge ${event.type}">${event.type.toUpperCase()}</div>
            <h2>${event.title}</h2>
            <div class="event-info">
              <p><strong>Date:</strong> ${formatDate(event.date)}</p>
              <p><strong>Time:</strong> ${event.time}</p>
              <p><strong>Course:</strong> ${event.course}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Description:</strong> ${event.description}</p>
            </div>
            <div class="event-modal-actions">
              <button class="edit-event-modal-btn">Edit Event</button>
              <button class="delete-event-modal-btn">Delete Event</button>
            </div>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show the modal with animation
        setTimeout(() => {
          modal.style.opacity = '1';
        }, 10);
        
        // Add close functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
          closeModal(modal);
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal(modal);
          }
        });
        
        // Edit button handler
        modal.querySelector('.edit-event-modal-btn').addEventListener('click', () => {
          closeModal(modal);
          showEventModal(null, null, event);
        });
        
        // Delete button handler
        modal.querySelector('.delete-event-modal-btn').addEventListener('click', () => {
          if (confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
            const eventIndex = events.findIndex(e => e.id === event.id);
            if (eventIndex !== -1) {
              events.splice(eventIndex, 1);
              closeModal(modal);
              renderCalendar(currentMonth, currentYear);
              if (eventDetails && !eventDetails.classList.contains('hidden')) {
                const [year, month, day] = event.date.split('-');
                const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
                showDayEvents(
                  events.filter(e => e.date === event.date), 
                  parseInt(day), 
                  monthName, 
                  parseInt(year)
                );
              }
            }
          }
        });
      }
      
      // Show modal for adding/editing events
      function showEventModal(dateString = null, timeString = null, eventToEdit = null) {
        const isEditing = eventToEdit !== null;
        
        // Default date to today if not specified
        if (!dateString && !isEditing) {
          const today = new Date();
          dateString = today.toISOString().split('T')[0];
        } else if (isEditing && !dateString) {
          dateString = eventToEdit.date;
        }
        
        // Default time to now if not specified
        if (!timeString && !isEditing) {
          const now = new Date();
          const hours = now.getHours();
          timeString = `${hours % 12 === 0 ? 12 : hours % 12}:00 ${hours < 12 ? 'AM' : 'PM'}`;
        } else if (isEditing && !timeString) {
          timeString = eventToEdit.time;
        }
        
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        modal.innerHTML = `
          <div class="event-modal-content">
            <span class="close-modal">&times;</span>
            <h2>${isEditing ? 'Edit Event' : 'Add New Event'}</h2>
            <form id="event-form">
              <div class="form-group">
                <label for="event-title">Event Title</label>
                <input type="text" id="event-title" required value="${isEditing ? eventToEdit.title : ''}">
              </div>
              <div class="form-group">
                <label for="event-type">Event Type</label>
                <select id="event-type" required>
                  <option value="exam" ${isEditing && eventToEdit.type === 'exam' ? 'selected' : ''}>Exam</option>
                  <option value="assignment" ${isEditing && eventToEdit.type === 'assignment' ? 'selected' : ''}>Assignment</option>
                  <option value="meeting" ${isEditing && eventToEdit.type === 'meeting' ? 'selected' : ''}>Meeting</option>
                  <option value="other" ${isEditing && eventToEdit.type === 'other' ? 'selected' : ''}>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label for="event-course">Course</label>
                <select id="event-course" required>
                  <option value="">Select a Course</option>
                  <option value="Introduction to UX Design" ${isEditing && eventToEdit.course === 'Introduction to UX Design' ? 'selected' : ''}>Introduction to UX Design</option>
                  <option value="Machine Learning Fundamentals" ${isEditing && eventToEdit.course === 'Machine Learning Fundamentals' ? 'selected' : ''}>Machine Learning Fundamentals</option>
                  <option value="Advanced JavaScript" ${isEditing && eventToEdit.course === 'Advanced JavaScript' ? 'selected' : ''}>Advanced JavaScript</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="event-date">Date</label>
                  <input type="date" id="event-date" required value="${dateString}">
                </div>
                <div class="form-group">
                  <label for="event-time">Time</label>
                  <input type="text" id="event-time" placeholder="e.g., 3:00 PM" required value="${timeString}">
                </div>
              </div>
              <div class="form-group">
                <label for="event-location">Location</label>
                <input type="text" id="event-location" placeholder="e.g., Room 302 or Online" required value="${isEditing ? eventToEdit.location : ''}">
              </div>
              <div class="form-group">
                <label for="event-description">Description</label>
                <textarea id="event-description" rows="3">${isEditing ? eventToEdit.description : ''}</textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="submit-event-btn">${isEditing ? 'Update Event' : 'Add Event'}</button>
              </div>
            </form>
          </div>
        `;
        
        document.body.appendChild(modal);
        
        // Show the modal with animation
        setTimeout(() => {
          modal.style.opacity = '1';
        }, 10);
        
        // Add close functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
          closeModal(modal);
        });
        
        // Close when clicking outside the modal content
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            closeModal(modal);
          }
        });
        
        // Form submission handler
        modal.querySelector('#event-form').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const formData = {
            title: document.getElementById('event-title').value,
            type: document.getElementById('event-type').value,
            course: document.getElementById('event-course').value,
            date: document.getElementById('event-date').value,
            time: document.getElementById('event-time').value,
            location: document.getElementById('event-location').value,
            description: document.getElementById('event-description').value || ''
          };
          
          if (isEditing) {
            // Update existing event
            const eventIndex = events.findIndex(e => e.id === eventToEdit.id);
            if (eventIndex !== -1) {
              events[eventIndex] = { ...events[eventIndex], ...formData };
            }
          } else {
            // Add new event
            const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
            events.push({
              id: newId,
              ...formData
            });
          }
          
          renderCalendar(currentMonth, currentYear);
          closeModal(modal);
          
          // Update day events view if open
          if (eventDetails && !eventDetails.classList.contains('hidden')) {
            const [year, month, day] = formData.date.split('-');
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
            showDayEvents(
              events.filter(e => e.date === formData.date), 
              parseInt(day), 
              monthName, 
              parseInt(year)
            );
          }
        });
      }
      
      // Initialize the calendar
      renderCalendar(currentMonth, currentYear);
    }
  
    // Helper function to parse time strings
    function parseTime(timeString) {
      const [timePart, period] = timeString.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      return hours * 60 + (minutes || 0);
    }
  
    //=============================
    // 4. ANIMATED COURSE CARDS
    //=============================
    function initializeAnimatedCourseCards() {
      // Sample course data
      const courses = [
        { id: 1, title: 'Introduction to UX Design', progress: 65, lastAccessed: '2 days ago', instructor: 'Sarah Johnson', image: 'ux_design.jpg' },
        { id: 2, title: 'Machine Learning Fundamentals', progress: 30, lastAccessed: '1 week ago', instructor: 'Dr. Michael Chen', image: 'ml_fundamentals.jpg' },
        { id: 3, title: 'Advanced JavaScript', progress: 85, lastAccessed: 'Yesterday', instructor: 'David Williams', image: 'advanced_js.jpg' }
      ];
      
      const coursesGrid = document.querySelector('.courses-grid');
      if (!coursesGrid) return;
      
      // Clear existing content
      coursesGrid.innerHTML = '';
      
      courses.forEach((course, index) => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.style.opacity = '0';
        courseCard.style.transform = 'translateY(20px)';
        
        courseCard.innerHTML = `
          <div class="course-image">
            <img src="${course.image || 'default_course.jpg'}" alt="${course.title}" onerror="this.src='https://via.placeholder.com/300x150?text=Course+Image'">
            <div class="course-overlay">
              <button class="resume-btn">Resume Course</button>
              <button class="details-btn">View Details</button>
            </div>
          </div>
          <div class="course-info">
            <h3 class="course-title">${course.title}</h3>
            <p class="course-instructor">Instructor: ${course.instructor}</p>
            <p class="course-last-accessed">Last accessed: ${course.lastAccessed}</p>
            <div class="progress-container">
              <div class="progress-bar" style="width: 0%"></div>
              <span class="progress-text">0% Complete</span>
            </div>
          </div>
        `;
        
        // Add interactive behavior
        const overlay = courseCard.querySelector('.course-overlay');
        courseCard.addEventListener('mouseenter', () => {
          overlay.style.opacity = '1';
        });
        
        courseCard.addEventListener('mouseleave', () => {
          overlay.style.opacity = '0';
        });
        
        // Add button click handlers
        courseCard.querySelector('.resume-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          showToast(`Resuming course: ${course.title}`);
        });
        
        courseCard.querySelector('.details-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          showCourseDetails(course);
        });
        
        // Add card click for expansion
        courseCard.addEventListener('click', () => {
          if (!courseCard.classList.contains('expanded')) {
            // Remove expanded class from any other cards
            document.querySelectorAll('.course-card.expanded').forEach(card => {
              card.classList.remove('expanded');
            });
            courseCard.classList.add('expanded');
          } else {
            courseCard.classList.remove('expanded');
          }
        });
        
        coursesGrid.appendChild(courseCard);
        
        // Animate card entrance with staggered delay
        setTimeout(() => {
          courseCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          courseCard.style.opacity = '1';
          courseCard.style.transform = 'translateY(0)';
          
          // Animate progress bar after card appears
          setTimeout(() => {
            const progressBar = courseCard.querySelector('.progress-bar');
            const progressText = courseCard.querySelector('.progress-text');
            
            progressBar.style.transition = 'width 1s ease';
            progressBar.style.width = `${course.progress}%`;
            
            // Animate progress text counter
            let currentProgress = 0;
            const progressInterval = setInterval(() => {
              currentProgress += 1;
              progressText.textContent = `${currentProgress}% Complete`;
              
              if (currentProgress >= course.progress) {
                clearInterval(progressInterval);
              }
            }, 1000 / course.progress);
          }, 500);
        }, index * 200);
      });
      
      // Add a "View All Courses" card
      const viewAllCard = document.createElement('div');
      viewAllCard.className = 'course-card view-all-card';
      viewAllCard.style.opacity = '0';
      viewAllCard.style.transform = 'translateY(20px)';
      
      viewAllCard.innerHTML = `
        <div class="view-all-content">
          <div class="view-all-icon">+</div>
          <p>View All Courses</p>
        </div>
      `;
      
      viewAllCard.addEventListener('click', () => {
        showToast('Navigating to all courses');
      });
      
      coursesGrid.appendChild(viewAllCard);
      
      // Animate the view all card
      setTimeout(() => {
        viewAllCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        viewAllCard.style.opacity = '1';
        viewAllCard.style.transform = 'translateY(0)';
      }, courses.length * 200);
    }
  
    // Function to show course details
    function showCourseDetails(course) {
      // Create a modal for course details
      const modal = document.createElement('div');
      modal.className = 'course-modal';
      modal.innerHTML = `
        <div class="course-modal-content">
          <span class="close-modal">&times;</span>
          <h2>${course.title}</h2>
          <div class="course-details">
            <p><strong>Instructor:</strong> ${course.instructor}</p>
            <p><strong>Progress:</strong> ${course.progress}%</p>
            <div class="modal-progress-bar">
              <div class="modal-progress-fill" style="width: 0%"></div>
            </div>
            <p><strong>Last Accessed:</strong> ${course.lastAccessed}</p>
            <div class="course-actions">
              <button class="resume-course-btn">Resume</button>
              <button class="syllabus-btn">View Syllabus</button>
              <button class="schedule-btn">Schedule Study Time</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Show the modal
      setTimeout(() => {
        modal.style.opacity = '1';
        
        // Animate progress bar
        setTimeout(() => {
          const progressFill = modal.querySelector('.modal-progress-fill');
          progressFill.style.transition = 'width 1s ease';
          progressFill.style.width = `${course.progress}%`;
        }, 300);
      }, 10);
      
      // Add close functionality
      modal.querySelector('.close-modal').addEventListener('click', () => {
        closeModal(modal);
      });
      
      // Close when clicking outside the modal content
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
      
      // Add button event handlers
      modal.querySelector('.resume-course-btn').addEventListener('click', () => {
        showToast(`Resuming course: ${course.title}`);
        closeModal(modal);
      });
      
      modal.querySelector('.syllabus-btn').addEventListener('click', () => {
        showToast(`Viewing syllabus for: ${course.title}`);
      });
      
      modal.querySelector('.schedule-btn').addEventListener('click', () => {
        showToast(`Scheduling study time for: ${course.title}`);
      });
    }
  
    //=============================
    // UTILITY FUNCTIONS
    //=============================
    
    // Show toast notification
    function showToast(message, duration = 3000) {
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      // Show toast with animation
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      }, 10);
      
      // Hide and remove toast after duration
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          if (toast.parentNode) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, duration);
    }
    
    // Helper function to format dates
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    // Helper function to capitalize first letter
    function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Close modal function
    function closeModal(modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        if (modal.parentNode) {
          document.body.removeChild(modal);
        }
      }, 300);
    }
  
    //=============================
    // INITIALIZE ALL FEATURES
    //=============================
    initializePersonalizedElements();
    initializeAchievementsAndStats();
    initializeInteractiveCalendar();
    initializeAnimatedCourseCards();
    
    // Add supporting CSS styles dynamically
    addSupportingStyles();
  });
  
  // Function to add supporting CSS styles
  function addSupportingStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Personalized Elements Styles */
      .welcome-text {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 5px;
        transition: transform 0.5s ease, opacity 0.5s ease;
      }
      
      .welcome-text.animated {
        animation: fadeInUp 0.8s ease;
      }
      
      .weather-icon {
        font-size: 24px;
        margin-left: 10px;
        animation: fadeIn 1s ease;
      }
      
      .streak-badge {
        cursor: pointer;
        transition: transform 0.3s ease;
      }
      
      .streak-badge:hover {
        transform: scale(1.05);
      }
      
      .streak-message {
        font-size: 12px;
        color: var(--primary-color, #4a6cf7);
        opacity: 0;
        transform: translateY(5px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .streak-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .streak-modal-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 700px;
        padding: 24px;
        position: relative;
      }
      
      .streak-summary {
        display: flex;
        justify-content: space-between;
        text-align: center;
        margin: 20px 0;
      }
      
      .streak-value {
        font-size: 32px;
        font-weight: 700;
        color: var(--primary-color, #4a6cf7);
        display: block;
      }
      
      .streak-label {
        font-size: 14px;
        color: #666;
      }
      
      .streak-calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 5px;
        margin-top: 10px;
      }
      
      .streak-date-box {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 4px;
        background-color: #f0f0f0;
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;
      }
      
      .streak-date-box:hover {
        transform: scale(1.1);
      }
      
      .streak-date-box.active {
        background-color: rgba(74, 108, 247, 0.2);
      }
      
      .streak-date-box.active.intensity-1 {
        background-color: rgba(74, 108, 247, 0.3);
      }
      
      .streak-date-box.active.intensity-2 {
        background-color: rgba(74, 108, 247, 0.5);
      }
      
      .streak-date-box.active.intensity-3 {
        background-color: rgba(74, 108, 247, 0.7);
      }
      
      .streak-date-box.active.intensity-4 {
        background-color: rgba(74, 108, 247, 0.9);
      }
      
      .streak-tooltip {
        position: fixed;
        background-color: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        opacity: 0;
        transform: translateY(5px);
        transition: opacity 0.2s ease, transform 0.2s ease;
        pointer-events: none;
      }
      
      .streak-chart-container {
        height: 200px;
        margin: 20px 0;
      }
      
      /* Course Card Styles */
      .course-card {
        position: relative;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        margin-bottom: 16px;
        cursor: pointer;
      }
      
      .course-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
      
      .course-image {
        position: relative;
        height: 140px;
        overflow: hidden;
      }
      
      .course-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .course-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .course-overlay button {
        margin: 5px;
        padding: 8px 16px;
        background-color: var(--primary-color, #4a6cf7);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .course-overlay button:hover {
        background-color: var(--primary-hover-color, #3a5ce6);
      }
      
      .course-info {
        padding: 16px;
      }
      
      .course-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .course-instructor, .course-last-accessed {
        font-size: 14px;
        color: #666;
        margin-bottom: 5px;
      }
      
      .progress-container {
        height: 8px;
        background-color: #e9ecef;
        border-radius: 4px;
        margin-top: 10px;
        overflow: hidden;
      }
      
      .progress-bar {
        height: 100%;
        background-color: var(--primary-color, #4a6cf7);
        border-radius: 4px;
        transition: width 1s ease;
      }
      
      .progress-text {
        font-size: 12px;
        color: #666;
        margin-top: 5px;
        text-align: right;
      }
      
      .course-card.expanded {
        height: auto;
        z-index: 10;
      }
      
      .view-all-card {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(74, 108, 247, 0.1);
        border: 2px dashed rgba(74, 108, 247, 0.3);
      }
      
      .view-all-content {
        text-align: center;
        padding: 20px;
      }
      
      .view-all-icon {
        font-size: 24px;
        width: 40px;
        height: 40px;
        background-color: rgba(74, 108, 247, 0.2);
        border-radius: 50%;
        margin: 0 auto 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color, #4a6cf7);
      }
      
      /* Course modal */
      .course-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .course-modal-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        padding: 24px;
        position: relative;
      }
      
      .modal-progress-bar {
        height: 8px;
        background-color: #e9ecef;
        border-radius: 4px;
        margin: 16px 0;
      }
      
      .modal-progress-fill {
        height: 100%;
        background-color: var(--primary-color, #4a6cf7);
        border-radius: 4px;
      }
      
      .course-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
      
      .course-actions button {
        padding: 10px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        transition: background-color 0.2s ease;
      }
      
      .resume-course-btn {
        background-color: var(--primary-color, #4a6cf7);
        color: white;
      }
      
      .resume-course-btn:hover {
        background-color: var(--primary-hover-color, #3a5ce6);
      }
      
      .syllabus-btn, .schedule-btn {
        background-color: #e9ecef;
        color: #333;
      }
      
      .syllabus-btn:hover, .schedule-btn:hover {
        background-color: #d9dee2;
      }
      
      /* Achievements section */
      .achievements-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      
      .achievements-toggle {
        display: flex;
        gap: 5px;
      }
      
      .toggle-btn {
        padding: 6px 10px;
        background-color: #f0f0f0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      
      .toggle-btn.active {
        background-color: var(--primary-color, #4a6cf7);
        color: white;
      }
      
      .achievement-xp {
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: 600;
      }
      
      .xp-icon {
        font-size: 16px;
      }
      
      .achievements-container {
        max-height: 300px;
        overflow-y: auto;
      }
      
      .achievement {
        display: flex;
        align-items: center;
        padding: 12px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin-bottom: 10px;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        opacity: 0;
        transform: translateY(10px);
      }
      
      .achievement:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .achievement.hovered {
        background-color: #f9f9f9;
      }
      
      .achievement-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--primary-color, #4a6cf7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-right: 12px;
      }
      
      .achievement-icon.locked {
        background-color: #e0e0e0;
        color: #888;
      }
      
      .achievement-content {
        flex: 1;
      }
      
      .achievement-title {
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .achievement-info, .achievement-date {
        font-size: 14px;
        color: #666;
      }
      
      .achievement-progress {
        margin-top: 8px;
        width: 100%;
      }
      
      .progress-bar {
        height: 6px;
        background-color: #e9ecef;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background-color: var(--primary-color, #4a6cf7);
        border-radius: 3px;
        transition: width 0.5s ease;
      }
      
      .progress-text {
        font-size: 12px;
        text-align: right;
        margin-top: 4px;
      }
      
      .achievement-xp-badge {
        background-color: var(--primary-color, #4a6cf7);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .achievement-xp-badge.locked {
        background-color: #e0e0e0;
        color: #888;
      }
      
      .achievement-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .achievement-modal-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        padding: 24px;
        position: relative;
      }
      
      .achievement-detail-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .achievement-large-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: var(--primary-color, #4a6cf7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
        margin-bottom: 16px;
      }
      
      .achievement-large-icon.locked {
        background-color: #e0e0e0;
        color: #888;
      }
      
      .achievement-xp-large {
        background-color: var(--primary-color, #4a6cf7);
        color: white;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 600;
        margin-top: 10px;
      }
      
      .achievement-xp-large.locked {
        background-color: #e0e0e0;
        color: #888;
      }
      
      .achievement-detail-body {
        margin: 20px 0;
        text-align: center;
      }
      
      .achievement-unlock-date {
        color: #666;
        font-style: italic;
        margin-top: 16px;
      }
      
      .achievement-progress-detail {
        margin: 16px 0;
      }
      
      .progress-bar-large {
        height: 10px;
        background-color: #e9ecef;
        border-radius: 5px;
        overflow: hidden;
        margin: 10px 0;
      }
      
      .progress-text-large {
        text-align: center;
        font-size: 14px;
        color: #666;
      }
      
      .achievement-tips {
        margin-top: 16px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .achievement-share {
        text-align: center;
      }
      
      .share-achievement-btn {
        padding: 10px 16px;
        background-color: var(--primary-color, #4a6cf7);
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .share-achievement-btn:
      /* Interactive Dashboard Styles - Part 2 */

/* Achievement Share Button Styles */
.share-achievement-btn:hover {
  background-color: var(--primary-hover-color, #3a5ce6);
}

/* Stats Section Styles */
.stats-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.stats-toggle {
  display: flex;
  gap: 5px;
}

.stats-period-btn {
  padding: 6px 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.stats-period-btn.active {
  background-color: var(--primary-color, #4a6cf7);
  color: white;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.hovered {
  background-color: #f9f9f9;
}

.stat-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.trend-icon {
  font-weight: bold;
}

.trend-up .trend-icon {
  color: #28a745;
}

.trend-down .trend-icon {
  color: #dc3545;
}

.trend-text {
  color: #666;
}

.stat-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 700px;
  padding: 24px;
  position: relative;
}

.stat-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.stat-large-icon {
  font-size: 30px;
  margin-right: 16px;
}

.stat-detail-header h2 {
  margin: 0;
  flex: 1;
}

.stat-period-label {
  font-size: 14px;
  color: #666;
}

.stat-chart-container {
  height: 300px;
  margin: 20px 0;
}

.stat-insights {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
}

.stat-insights h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

/* Calendar Styles */
.calendar-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  margin: 0;
  font-size: 20px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 15px;
}

.calendar-navigation button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.calendar-navigation button:hover {
  background-color: #f0f0f0;
}

.calendar-month-year {
  font-size: 16px;
  font-weight: 600;
  min-width: 140px;
  text-align: center;
}

.calendar-view-options {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.view-btn {
  padding: 6px 12px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.view-btn.active {
  background-color: var(--primary-color, #4a6cf7);
  color: white;
}

.add-event-btn {
  padding: 6px 12px;
  background-color: var(--primary-color, #4a6cf7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-event-btn:hover {
  background-color: var(--primary-hover-color, #3a5ce6);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
}

.weekday {
  padding: 10px;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  height: 80px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 5px;
  text-align: right;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.day:hover {
  background-color: #f9f9f9;
  transform: scale(1.03);
}

.day.today {
  background-color: rgba(74, 108, 247, 0.1);
  font-weight: 600;
  border-color: var(--primary-color, #4a6cf7);
}

.prev-month-day, .next-month-day {
  color: #aaa;
  background-color: #f9f9f9;
  opacity: 0.6;
}

.has-events {
  font-weight: 600;
}

.event-indicators {
  position: absolute;
  bottom: 5px;
  left: 5px;
  right: 5px;
  display: flex;
  gap: 3px;
}

.event-indicator {
  height: 5px;
  flex: 1;
  border-radius: 2px;
}

.event-indicator.exam {
  background-color: #dc3545;
}

.event-indicator.assignment {
  background-color: #fd7e14;
}

.event-indicator.meeting {
  background-color: #28a745;
}

.event-indicator.other {
  background-color: #6c757d;
}

.event-count {
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: var(--primary-color, #4a6cf7);
  color: white;
  font-size: 12px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-details {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  padding: 16px;
  animation: fadeIn 0.3s ease;
}

.event-details.hidden {
  display: none;
}

.event-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.event-details-header h3 {
  margin: 0;
}

.close-events {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.day-events-list {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 4px solid #ccc;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.event-item.exam {
  border-left-color: #dc3545;
}

.event-item.assignment {
  border-left-color: #fd7e14;
}

.event-item.meeting {
  border-left-color: #28a745;
}

.event-item.other {
  border-left-color: #6c757d;
}

.event-time {
  width: 80px;
  font-weight: 600;
  font-size: 14px;
}

.event-content {
  flex: 1;
}

.event-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.event-course, .event-location {
  font-size: 14px;
  color: #666;
}

.event-actions {
  display: flex;
  gap: 5px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.event-item:hover .event-actions {
  opacity: 1;
}

.event-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.event-actions button:hover {
  background-color: #f0f0f0;
}

.event-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.event-modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  padding: 24px;
  position: relative;
}

.event-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
}

.event-type-badge.exam {
  background-color: #dc3545;
}

.event-type-badge.assignment {
  background-color: #fd7e14;
}

.event-type-badge.meeting {
  background-color: #28a745;
}

.event-type-badge.other {
  background-color: #6c757d;
}

.event-info p {
  margin: 8px 0;
}

.event-modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.event-modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.edit-event-modal-btn {
  background-color: #f0f0f0;
  color: #333;
}

.edit-event-modal-btn:hover {
  background-color: #e0e0e0;
}

.delete-event-modal-btn {
  background-color: #dc3545;
  color: white;
}

.delete-event-modal-btn:hover {
  background-color: #c82333;
}

/* Week view styles */
.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  text-align: center;
  font-weight: 600;
  border-bottom: 1px solid #eee;
}

.day-header {
  padding: 10px;
  border-right: 1px solid #eee;
}

.day-header.today {
  background-color: rgba(74, 108, 247, 0.1);
  color: var(--primary-color, #4a6cf7);
}

.week-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  height: 500px;
  overflow-y: auto;
}

.hours-column {
  display: flex;
  flex-direction: column;
}

.hour-cell {
  height: 60px;
  padding: 5px;
  border-right: 1px solid #eee;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  text-align: center;
}

.day-column {
  display: flex;
  flex-direction: column;
}

.hour-cell.has-events {
  background-color: rgba(74, 108, 247, 0.05);
}

/* Day view styles */
.day-view-header {
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
}

.day-schedule {
  max-height: 600px;
  overflow-y: auto;
}

.hour-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.hour-label {
  width: 80px;
  padding: 10px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

.hour-content {
  flex: 1;
  min-height: 60px;
  padding: 5px;
  position: relative;
}

.day-event-item {
  background-color: rgba(74, 108, 247, 0.1);
  border-left: 4px solid var(--primary-color, #4a6cf7);
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.day-event-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.day-event-item.exam {
  background-color: rgba(220, 53, 69, 0.1);
  border-left-color: #dc3545;
}

.day-event-item.assignment {
  background-color: rgba(253, 126, 20, 0.1);
  border-left-color: #fd7e14;
}

.day-event-item.meeting {
  background-color: rgba(40, 167, 69, 0.1);
  border-left-color: #28a745;
}

.day-event-item.other {
  background-color: rgba(108, 117, 125, 0.1);
  border-left-color: #6c757d;
}

/* Forms in modals */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.form-row .form-group {
  flex: 1;
}

.form-actions {
  text-align: right;
  margin-top: 20px;
}

.submit-event-btn {
  padding: 10px 16px;
  background-color: var(--primary-color, #4a6cf7);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.submit-event-btn:hover {
  background-color: var(--primary-hover-color, #3a5ce6);
}

/* Toast notifications */
.toast-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #333;
  color: white;
  padding: 12px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Modal close button */
.close-modal {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-modal:hover {
  color: #333;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .course-actions {
    flex-direction: column;
  }
  
  .calendar-view-options {
    display: none;
  }
  
  .event-modal-content,
  .course-modal-content,
  .achievement-modal-content,
  .stat-modal-content {
    width: 95%;
    padding: 16px;
  }
}
  .share-achievement-btn:hover {
      background-color: var(--primary-hover-color, #3a5ce6);
    }

    /* Stats Section Styles */
    .stats-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .stats-toggle {
      display: flex;
      gap: 5px;
    }

    .stats-period-btn {
      padding: 6px 10px;
      background-color: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .stats-period-btn.active {
      background-color: var(--primary-color, #4a6cf7);
      color: white;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }

    .stat-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card.hovered {
      background-color: #f9f9f9;
    }

    .stat-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .stat-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .stat-trend {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 5px;
      font-size: 12px;
    }

    .trend-icon {
      font-weight: bold;
    }

    .trend-up .trend-icon {
      color: #28a745;
    }

    .trend-down .trend-icon {
      color: #dc3545;
    }

    .trend-text {
      color: #666;
    }

    .stat-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-modal-content {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 700px;
      padding: 24px;
      position: relative;
    }

    .stat-detail-header {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
    }

    .stat-large-icon {
      font-size: 30px;
      margin-right: 16px;
    }

    .stat-detail-header h2 {
      margin: 0;
      flex: 1;
    }

    .stat-period-label {
      font-size: 14px;
      color: #666;
    }

    .stat-chart-container {
      height: 300px;
      margin: 20px 0;
    }

    .stat-insights {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-top: 20px;
    }

    .stat-insights h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
    }

    /* Calendar Styles */
    .calendar-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-top: 20px;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .calendar-header h2 {
      margin: 0;
      font-size: 20px;
    }

    .calendar-navigation {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .calendar-navigation button {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.2s ease;
    }

    .calendar-navigation button:hover {
      background-color: #f0f0f0;
    }

    .calendar-month-year {
      font-size: 16px;
      font-weight: 600;
      min-width: 140px;
      text-align: center;
    }

    .calendar-view-options {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }

    .view-btn {
      padding: 6px 12px;
      background-color: #f0f0f0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    .view-btn.active {
      background-color: var(--primary-color, #4a6cf7);
      color: white;
    }

    .add-event-btn {
      padding: 6px 12px;
      background-color: var(--primary-color, #4a6cf7);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .add-event-btn:hover {
      background-color: var(--primary-hover-color, #3a5ce6);
    }

    .calendar-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .weekday {
      padding: 10px;
    }

    .calendar-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 5px;
    }

    .day {
      height: 80px;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 5px;
      text-align: right;
      position: relative;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
    }

    .day:hover {
      background-color: #f9f9f9;
      transform: scale(1.03);
    }

    .day.today {
      background-color: rgba(74, 108, 247, 0.1);
      font-weight: 600;
      border-color: var(--primary-color, #4a6cf7);
    }

    .prev-month-day, .next-month-day {
      color: #aaa;
      background-color: #f9f9f9;
      opacity: 0.6;
    }

    .has-events {
      font-weight: 600;
    }

    .event-indicators {
      position: absolute;
      bottom: 5px;
      left: 5px;
      right: 5px;
      display: flex;
      gap: 3px;
    }

    .event-indicator {
      height: 5px;
      flex: 1;
      border-radius: 2px;
    }

    .event-indicator.exam {
      background-color: #dc3545;
    }

    .event-indicator.assignment {
      background-color: #fd7e14;
    }

    .event-indicator.meeting {
      background-color: #28a745;
    }

    .event-indicator.other {
      background-color: #6c757d;
    }

    .event-count {
      position: absolute;
      top: 5px;
      left: 5px;
      background-color: var(--primary-color, #4a6cf7);
      color: white;
      font-size: 12px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .event-details {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-top: 20px;
      padding: 16px;
      animation: fadeIn 0.3s ease;
    }

    .event-details.hidden {
      display: none;
    }

    .event-details-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .event-details-header h3 {
      margin: 0;
    }

    .close-events {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }

    .day-events-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .event-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 8px;
      border-left: 4px solid #ccc;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .event-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .event-item.exam {
      border-left-color: #dc3545;
    }

    .event-item.assignment {
      border-left-color: #fd7e14;
    }

    .event-item.meeting {
      border-left-color: #28a745;
    }

    .event-item.other {
      border-left-color: #6c757d;
    }

    .event-time {
      width: 80px;
      font-weight: 600;
      font-size: 14px;
    }

    .event-content {
      flex: 1;
    }

    .event-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .event-course, .event-location {
      font-size: 14px;
      color: #666;
    }

    .event-actions {
      display: flex;
      gap: 5px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .event-item:hover .event-actions {
      opacity: 1;
    }

    .event-actions button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .event-actions button:hover {
      background-color: #f0f0f0;
    }

    .event-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .event-modal-content {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      width: 90%;
      max-width: 500px;
      padding: 24px;
      position: relative;
    }

    .event-type-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .event-type-badge.exam {
      background-color: #dc3545;
    }

    .event-type-badge.assignment {
      background-color: #fd7e14;
    }

    .event-type-badge.meeting {
      background-color: #28a745;
    }

    .event-type-badge.other {
      background-color: #6c757d;
    }

    .event-info p {
      margin: 8px 0;
    }

    .event-modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .event-modal-actions button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .edit-event-modal-btn {
      background-color: #f0f0f0;
      color: #333;
    }

    .edit-event-modal-btn:hover {
      background-color: #e0e0e0;
    }

    .delete-event-modal-btn {
      background-color: #dc3545;
      color: white;
    }

    .delete-event-modal-btn:hover {
      background-color: #c82333;
    }

    /* Week view styles */
    .week-header {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      text-align: center;
      font-weight: 600;
      border-bottom: 1px solid #eee;
    }

    .day-header {
      padding: 10px;
      border-right: 1px solid #eee;
    }

    .day-header.today {
      background-color: rgba(74, 108, 247, 0.1);
      color: var(--primary-color, #4a6cf7);
    }

    .week-grid {
      display: grid;
      grid-template-columns: 80px repeat(7, 1fr);
      height: 500px;
      overflow-y: auto;
    }

    .hours-column {
      display: flex;
      flex-direction: column;
    }

    .hour-cell {
      height: 60px;
      padding: 5px;
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
      font-size: 12px;
      text-align: center;
    }

    .day-column {
      display: flex;
      flex-direction: column;
    }

    .hour-cell.has-events {
      background-color: rgba(74, 108, 247, 0.05);
    }

    /* Day view styles */
    .day-view-header {
      text-align: center;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .day-schedule {
      max-height: 600px;
      overflow-y: auto;
    }

    .hour-row {
      display: flex;
      border-bottom: 1px solid #eee;
    }

    .hour-label {
      width: 80px;
      padding: 10px;
      text-align: right;
      font-size: 14px;
      color: #666;
    }

    .hour-content {
      flex: 1;
      min-height: 60px;
      padding: 5px;
      position: relative;
    }

    .day-event-item {
      background-color: rgba(74, 108, 247, 0.1);
      border-left: 4px solid var(--primary-color, #4a6cf7);
      border-radius: 4px;
      padding: 8px;
      margin-bottom: 5px;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .day-event-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .day-event-item.exam {
      background-color: rgba(220, 53, 69, 0.1);
      border-left-color: #dc3545;
    }

    .day-event-item.assignment {
      background-color: rgba(253, 126, 20, 0.1);
      border-left-color: #fd7e14;
    }

    .day-event-item.meeting {
      background-color: rgba(40, 167, 69, 0.1);
      border-left-color: #28a745;
    }

    .day-event-item.other {
      background-color: rgba(108, 117, 125, 0.1);
      border-left-color: #6c757d;
    }

    /* Forms in modals */
    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-row {
      display: flex;
      gap: 10px;
    }

    .form-row .form-group {
      flex: 1;
    }

    .form-actions {
      text-align: right;
      margin-top: 20px;
    }

    .submit-event-btn {
      padding: 10px 16px;
      background-color: var(--primary-color, #4a6cf7);
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .submit-event-btn:hover {
      background-color: var(--primary-hover-color, #3a5ce6);
    }

    /* Close modal button */
    .close-modal {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 24px;
      color: #666;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .close-modal:hover {
      color: #333;
    }

    /* Toast notifications */
    .toast-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #333;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 1100;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .stats-container {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .course-actions {
        flex-direction: column;
      }
      
      .calendar-view-options {
        display: none;
      }
      
      .event-modal-content,
      .course-modal-content,
      .achievement-modal-content,
      .stat-modal-content {
        width: 95%;
        padding: 16px;
      }
    }
  `;
  
  // Append style element to head
  document.head.appendChild(styleElement);
}