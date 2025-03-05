// Analytics functionality for Progress Analytics page
// This script handles the analytics visualizations

// Add this to the top of your analytics.js file to set global chart defaults

/**
 * Set global Chart.js defaults for better readability
 */
function setChartGlobalDefaults() {
  if (typeof Chart !== 'undefined') {
    // Get theme
    const isNightMode = document.documentElement.getAttribute('data-theme') === 'night';
    
    // Set color based on theme
    const textColor = isNightMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.8)';
    const gridColor = isNightMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const tooltipBgColor = isNightMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
    const tooltipTextColor = isNightMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)';
    
    // Default font settings
    Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    Chart.defaults.font.size = 14;
    Chart.defaults.font.weight = '500';
    
    // Default colors
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;
    
    // Improved animation
    Chart.defaults.animation.duration = 1200;
    Chart.defaults.animation.easing = 'easeOutQuart';
    
    // Enhanced responsiveness
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.responsive = true;
    
    // Better tooltips
    Chart.defaults.plugins.tooltip.backgroundColor = tooltipBgColor;
    Chart.defaults.plugins.tooltip.titleColor = tooltipTextColor;
    Chart.defaults.plugins.tooltip.bodyColor = tooltipTextColor;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.titleFont = {
      size: 16,
      weight: 'bold'
    };
    Chart.defaults.plugins.tooltip.bodyFont = {
      size: 14,
      weight: 'normal'
    };
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding = 6;
    Chart.defaults.plugins.tooltip.boxWidth = 12;
    Chart.defaults.plugins.tooltip.boxHeight = 12;
    Chart.defaults.plugins.tooltip.usePointStyle = true;
    
    // Better legends
    Chart.defaults.plugins.legend.position = 'bottom';
    Chart.defaults.plugins.legend.labels.padding = 20;
    Chart.defaults.plugins.legend.labels.boxWidth = 15;
    Chart.defaults.plugins.legend.labels.boxHeight = 15;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.color = textColor;
    Chart.defaults.plugins.legend.labels.font = {
      size: 14,
      weight: '600'
    };
    
    // Add shadow for line elements
    Chart.defaults.elements.line.borderWidth = 3;
    Chart.defaults.elements.line.tension = 0.4;
    
    // Improved point styling
    Chart.defaults.elements.point.radius = 4;
    Chart.defaults.elements.point.hoverRadius = 6;
    
    // Better bar styling
    Chart.defaults.elements.bar.borderRadius = 6;
    Chart.defaults.elements.bar.borderSkipped = false;
    
    console.log('Chart.js global defaults set for better readability');
  }
}

// Enhanced Streak Line Chart
function createStreakLineChart() {
  const ctx = document.getElementById('streakLineChart');
  if (!ctx) return;
  
  // Sample data - would come from API in real app
  const streakData = {
    labels: ['Apr 20', 'Apr 21', 'Apr 22', 'Apr 23', 'Apr 24', 'Apr 25', 'Apr 26', 'Apr 27', 'Apr 28', 'Apr 29', 'Apr 30', 'May 1', 'May 2', 'May 3', 'May 4'],
    datasets: [{
      label: 'Daily Streak',
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      borderColor: 'rgba(89, 151, 172, 1)',
      backgroundColor: 'rgba(89, 151, 172, 0.15)',
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: 'rgba(89, 151, 172, 1)',
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverBorderWidth: 2,
      pointHoverBackgroundColor: 'rgba(89, 151, 172, 1)',
      pointHoverBorderColor: '#fff',
      // Apply shadow to make the line stand out more
      borderJoinStyle: 'round',
      borderCapStyle: 'round'
    }]
  };
  
  // Adjust for night mode
  if (document.documentElement.getAttribute('data-theme') === 'night') {
    streakData.datasets[0].borderColor = 'rgba(123, 181, 245, 1)';
    streakData.datasets[0].backgroundColor = 'rgba(123, 181, 245, 0.2)';
    streakData.datasets[0].pointBackgroundColor = 'rgba(123, 181, 245, 1)';
    streakData.datasets[0].pointHoverBackgroundColor = 'rgba(123, 181, 245, 1)';
  }
  
  new Chart(ctx, {
    type: 'line',
    data: streakData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          right: 20,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              return `Streak: ${context.raw} days`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grace: '10%',
          title: {
            display: true,
            text: 'Streak Days',
            padding: {
              bottom: 10,
              top: 10
            },
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            display: true,
            drawBorder: true,
            drawOnChartArea: true,
            drawTicks: true,
            color: function(context) {
              if (context.tick.value === 0) {
                return document.documentElement.getAttribute('data-theme') === 'night' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.2)';
              }
              return document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)';
            }
          },
          ticks: {
            padding: 10,
            font: {
              size: 12
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 12
            },
            padding: 8,
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

// Enhanced Quiz Status Donut Chart
function createQuizStatusChart() {
  const ctx = document.getElementById('quizStatusChart');
  if (!ctx) return;
  
  // Sample data
  const quizData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [7, 3],
      backgroundColor: [
        'rgba(89, 151, 172, 1)',
        '#e5e7eb'
      ],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };
  
  // Adjust colors for night mode
  if (document.documentElement.getAttribute('data-theme') === 'night') {
    quizData.datasets[0].backgroundColor[0] = 'rgba(123, 181, 245, 1)';
    quizData.datasets[0].backgroundColor[1] = '#31456e';
  }
  
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: quizData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label;
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} out of ${total} (${percentage}%)`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
  
  // Add center text for better visibility
  const centerText = {
    id: 'centerText',
    afterDraw: function(chart) {
      const width = chart.width;
      const height = chart.height;
      const ctx = chart.ctx;
      
      ctx.restore();
      
      // Calculate percentage
      const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
      const completed = chart.data.datasets[0].data[0];
      const percentage = Math.round((completed / total) * 100);
      
      // Text style
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Percentage
      ctx.font = '700 28px sans-serif';
      ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'night' 
        ? 'rgba(255, 255, 255, 0.95)' 
        : 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(`${percentage}%`, width / 2, height / 2 - 10);
      
      // Label
      ctx.font = '500 14px sans-serif';
      ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'night' 
        ? 'rgba(255, 255, 255, 0.7)' 
        : 'rgba(0, 0, 0, 0.6)';
      ctx.fillText('COMPLETE', width / 2, height / 2 + 15);
      
      ctx.save();
    }
  };
  
  // Add the plugin
  chart.options.plugins.centerText = true;
  chart.register(centerText);
  chart.update();
}

// Enhanced Activity Bar Chart
function createActivityBarChart() {
  const ctx = document.getElementById('activityBarChart');
  if (!ctx) return;
  
  // Sample data - would come from API in real app
  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Hours Studied',
      data: [2.5, 3.0, 1.5, 3.5, 2.0, 1.0, 0.5],
      backgroundColor: function(context) {
        const value = context.raw;
        const max = Math.max(...context.dataset.data);
        const opacity = 0.4 + (value / max) * 0.6;
        
        return document.documentElement.getAttribute('data-theme') === 'night'
          ? `rgba(123, 181, 245, ${opacity})`
          : `rgba(89, 151, 172, ${opacity})`;
      },
      borderRadius: 6,
      borderWidth: 1,
      borderColor: document.documentElement.getAttribute('data-theme') === 'night'
        ? 'rgba(123, 181, 245, 0.8)'
        : 'rgba(89, 151, 172, 0.8)',
      hoverBackgroundColor: document.documentElement.getAttribute('data-theme') === 'night'
        ? 'rgba(123, 181, 245, 0.9)'
        : 'rgba(89, 151, 172, 0.9)',
      barPercentage: 0.7,
      categoryPercentage: 0.7
    }]
  };
  
  new Chart(ctx, {
    type: 'bar',
    data: activityData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 10,
          left: 10
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              return `${context[0].label}`;
            },
            label: function(context) {
              const value = context.raw;
              return `${value} hours studied`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grace: '15%',
          title: {
            display: true,
            text: 'Hours',
            padding: {
              bottom: 10,
              top: 10
            },
            font: {
              size: 14,
              weight: 'bold'
            }
          },
          grid: {
            color: function(context) {
              if (context.tick.value === 0) {
                return document.documentElement.getAttribute('data-theme') === 'night' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.2)';
              }
              return document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)';
            }
          },
          ticks: {
            padding: 10,
            callback: function(value) {
              return value + 'h';
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            padding: 10,
            font: {
              size: 13,
              weight: '500'
            }
          }
        }
      }
    }
  });
}

// This will prevent initializing analytics multiple times
let analyticsInitialized = false;

// Main initialization function
function initializeAnalytics() {
  // Prevent multiple initializations
  if (analyticsInitialized) return;
  
  console.log('Initializing analytics...');
  
  // Make sure Chart.js is available
  if (typeof Chart !== 'undefined') {
    // Set improved chart defaults
    if (window.setChartGlobalDefaults) {
      window.setChartGlobalDefaults();
    }
    
    // Create the charts
    createStreakLineChart();
    createQuizStatusChart(); 
    createActivityBarChart();
    createSkillRadarChart();
    createMasteryBubbleChart();
    createActivityHeatmap();

    // Update analytics cards with data
    updateAnalyticsCards();
    
    // Mark as initialized
    analyticsInitialized = true;
  } else {
    console.warn('Chart.js is not loaded. Advanced charts will not be displayed.');
    
    // Try to load Chart.js if it's not available
    loadChartJS();
  }
}

// Function to load Chart.js dynamically if it's not already available
function loadChartJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = function() {
    console.log('Chart.js loaded successfully');
    initializeAnalytics();
  };
  script.onerror = function() {
    console.error('Failed to load Chart.js');
  };
  document.head.appendChild(script);
}

// Update analytics cards with data from the data adapter
async function updateAnalyticsCards() {
  try {
    // Get data from the adapter
    const userData = await window.analyticsData.getUserProfile();
    const progressData = await window.analyticsData.getCourseProgress();
    const quizData = await window.analyticsData.getQuizPerformance();
    const activityData = await window.analyticsData.getStudyActivity();
    
    // Update course progress card
    const progressValue = document.querySelector('.analytics-card:nth-child(1) .analytics-value');
    const progressBar = document.querySelector('.analytics-card:nth-child(1) .progress-fill');
    const progressDetails = document.querySelector('.analytics-card:nth-child(1) .analytics-details');
    
    if (progressValue && progressBar && progressDetails) {
      progressValue.textContent = progressData.overallPercentage + '%';
      progressBar.style.width = progressData.overallPercentage + '%';
      progressDetails.innerHTML = `
        <p>${progressData.modulesCompleted} of ${progressData.totalModules} modules completed</p>
        <p>Estimated completion: ${progressData.estimatedCompletionDate}</p>
      `;
    }
    
    // Update streak stats card
    updateStreakCard(userData);
    
    // Update quiz performance card
    updateQuizCard(quizData);
    
    // Update study time card
    updateStudyTimeCard(activityData);
    
  } catch (error) {
    console.error('Error updating analytics cards:', error);
  }
}

// Helper function to update streak card
function updateStreakCard(userData) {
  const currentStreakValue = document.querySelector('.streak-stats .streak-stat:first-child .analytics-value');
  const longestStreakValue = document.querySelector('.streak-stats .streak-stat:last-child .analytics-value');
  
  if (currentStreakValue && longestStreakValue) {
    currentStreakValue.textContent = userData.currentStreak;
    longestStreakValue.textContent = userData.longestStreak;
  }
}

// Helper function to update quiz card
function updateQuizCard(quizData) {
  const completedSegment = document.querySelector('.chart-segment.completed');
  const pendingSegment = document.querySelector('.chart-segment.pending');
  const quizLegend = document.querySelector('.chart-legend');
  
  if (completedSegment && pendingSegment && quizLegend) {
    const completedPercentage = (quizData.completed / quizData.totalQuizzes) * 100;
    completedSegment.style.setProperty('--percentage', completedPercentage);
    completedSegment.textContent = Math.round(completedPercentage) + '%';
    
    const pendingPercentage = (quizData.pending / quizData.totalQuizzes) * 100;
    pendingSegment.textContent = Math.round(pendingPercentage) + '%';
    
    const legendItems = quizLegend.querySelectorAll('.legend-text');
    if (legendItems.length >= 2) {
      legendItems[0].textContent = `Completed (${quizData.completed}/${quizData.totalQuizzes})`;
      legendItems[1].textContent = `Pending (${quizData.pending}/${quizData.totalQuizzes})`;
    }
  }
}

// Helper function to update study time card
function updateStudyTimeCard(activityData) {
  const timeValue = document.querySelector('.time-stats .analytics-value');
  const chartBars = document.querySelectorAll('.weekly-chart .chart-bar');
  const timeDetails = document.querySelector('.analytics-card:nth-child(4) .analytics-details');
  
  if (timeValue) {
    timeValue.textContent = activityData.totalHours + 'h';
  }
  
  if (chartBars.length === 7 && activityData.weeklyHours.length === 7) {
    // Find the maximum value for scaling
    const maxHours = Math.max(...activityData.weeklyHours);
    
    // Update each bar
    chartBars.forEach((bar, index) => {
      const percentage = (activityData.weeklyHours[index] / maxHours) * 100;
      bar.style.setProperty('--height', percentage + '%');
    });
  }
  
  if (timeDetails) {
    timeDetails.innerHTML = `
      <p>Peak study day: ${activityData.peakDay} (${activityData.weeklyHours[getDayIndex(activityData.peakDay)]}h)</p>
      <p>Average daily: ${activityData.averageDailyStudy}h</p>
    `;
  }
}

// Helper function to get day index from name
function getDayIndex(dayName) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days.indexOf(dayName);
}

// Create streak line chart
function createStreakLineChart() {
  const ctx = document.getElementById('streakLineChart');
  if (!ctx) return;
  
  // Sample data - would come from API in real app
  const streakData = {
    labels: ['Apr 20', 'Apr 21', 'Apr 22', 'Apr 23', 'Apr 24', 'Apr 25', 'Apr 26', 'Apr 27', 'Apr 28', 'Apr 29', 'Apr 30', 'May 1', 'May 2', 'May 3', 'May 4'],
    datasets: [{
      label: 'Daily Streak',
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      borderColor: 'rgba(89, 151, 172, 1)',
      backgroundColor: 'rgba(89, 151, 172, 0.1)',
      fill: true,
      tension: 0.3
    }]
  };
  
  new Chart(ctx, {
    type: 'line',
    data: streakData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Day ${context.raw}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Streak Days'
          }
        }
      }
    }
  });
}

// Create quiz status donut chart
function createQuizStatusChart() {
  const ctx = document.getElementById('quizStatusChart');
  if (!ctx) return;
  
  // Sample data
  const quizData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [7, 3],
      backgroundColor: [
        'rgba(89, 151, 172, 1)',
        '#e5e7eb'
      ],
      borderWidth: 0
    }]
  };
  
  // Adjust colors for night mode
  if (document.documentElement.getAttribute('data-theme') === 'night') {
    quizData.datasets[0].backgroundColor[0] = 'rgba(123, 181, 245, 1)';
    quizData.datasets[0].backgroundColor[1] = '#31456e';
  }
  
  new Chart(ctx, {
    type: 'doughnut',
    data: quizData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label;
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Create activity bar chart 
function createActivityBarChart() {
  const ctx = document.getElementById('activityBarChart');
  if (!ctx) return;
  
  // Sample data - would come from API in real app
  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Hours Studied',
      data: [2.5, 3.0, 1.5, 3.5, 2.0, 1.0, 0.5],
      backgroundColor: 'rgba(89, 151, 172, 0.8)',
      borderRadius: 4
    }]
  };
  
  // Adjust colors for night mode
  if (document.documentElement.getAttribute('data-theme') === 'night') {
    activityData.datasets[0].backgroundColor = 'rgba(123, 181, 245, 0.8)';
  }
  
  new Chart(ctx, {
    type: 'bar',
    data: activityData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          }
        }
      }
    }
  });
}

// Create radar chart for skill coverage
async function createSkillRadarChart() {
  const ctx = document.getElementById('skillCoverageChart');
  if (!ctx) return;
  
  try {
    // Get skill data from the adapter
    const skillData = await window.analyticsData.getSkillCoverage();
    
    // Prepare data for Chart.js
    const chartData = {
      labels: skillData.skills.map(skill => skill.name),
      datasets: [
        {
          label: 'Your Skill Coverage',
          data: skillData.skills.map(skill => skill.userScore),
          backgroundColor: 'rgba(89, 151, 172, 0.2)',
          borderColor: 'rgba(89, 151, 172, 1)',
          pointBackgroundColor: 'rgba(89, 151, 172, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(89, 151, 172, 1)',
        },
        {
          label: 'Course Average',
          data: skillData.skills.map(skill => skill.courseAverage),
          backgroundColor: 'rgba(230, 140, 140, 0.2)',
          borderColor: 'rgba(230, 140, 140, 1)',
          pointBackgroundColor: 'rgba(230, 140, 140, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(230, 140, 140, 1)',
        }
      ]
    };
    
    // Adjust colors for dark mode
    if (document.documentElement.getAttribute('data-theme') === 'night') {
      chartData.datasets[0].backgroundColor = 'rgba(123, 181, 245, 0.2)';
      chartData.datasets[0].borderColor = 'rgba(123, 181, 245, 1)';
      chartData.datasets[0].pointBackgroundColor = 'rgba(123, 181, 245, 1)';
      chartData.datasets[0].pointHoverBorderColor = 'rgba(123, 181, 245, 1)';
      
      chartData.datasets[1].backgroundColor = 'rgba(245, 158, 158, 0.2)';
      chartData.datasets[1].borderColor = 'rgba(245, 158, 158, 1)';
      chartData.datasets[1].pointBackgroundColor = 'rgba(245, 158, 158, 1)';
      chartData.datasets[1].pointHoverBorderColor = 'rgba(245, 158, 158, 1)';
    }
    
    // Create the chart
    new Chart(ctx, {
      type: 'radar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          line: {
            borderWidth: 2
          }
        },
        scales: {
          r: {
            angleLines: {
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)'
            },
            grid: {
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              backdropColor: 'transparent',
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)'
            },
            pointLabels: {
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.raw + '%';
              }
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)'
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating skill radar chart:', error);
    ctx.parentElement.innerHTML = '<p class="chart-error">Unable to load skill data</p>';
  }
}

// Create bubble chart for mastery by topic
async function createMasteryBubbleChart() {
  const ctx = document.getElementById('masteryBubbleChart');
  if (!ctx) return;
  
  try {
    // Get topic mastery data from the adapter
    const topicData = await window.analyticsData.getTopicMastery();
    
    // Prepare data for Chart.js
    const bubbleData = {
      datasets: [{
        label: 'Topic Mastery',
        data: topicData.topics.map(topic => ({
          x: topic.position,
          y: topic.mastery,
          r: topic.importance
        })),
        backgroundColor: function(context) {
          const value = context.raw.y;
          const alpha = 0.7;
          
          if (value > 80) return `rgba(46, 204, 113, ${alpha})`;
          if (value > 70) return `rgba(52, 152, 219, ${alpha})`;
          if (value > 60) return `rgba(155, 89, 182, ${alpha})`;
          return `rgba(231, 76, 60, ${alpha})`;
        }
      }]
    };
    
    // Create the chart
    new Chart(ctx, {
      type: 'bubble',
      data: bubbleData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 100,
            grid: {
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              display: false
            },
            title: {
              display: true,
              text: 'Topic Progression',
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)'
            }
          },
          y: {
            min: 40,
            max: 100,
            grid: {
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              },
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)'
            },
            title: {
              display: true,
              text: 'Mastery Level',
              color: document.documentElement.getAttribute('data-theme') === 'night' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return [
                  'Topic: ' + getTopicName(context.raw.x, topicData.topics),
                  'Mastery: ' + context.raw.y + '%',
                  'Importance: ' + getImportanceLevel(context.raw.r)
                ];
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating mastery bubble chart:', error);
    ctx.parentElement.innerHTML = '<p class="chart-error">Unable to load topic mastery data</p>';
  }
}

// Helper function to get topic name from position
function getTopicName(position, topics) {
  const topic = topics.find(t => t.position === position);
  return topic ? topic.name : 'Unknown Topic';
}

// Helper function to map radius to importance
function getImportanceLevel(r) {
  if (r >= 13) return 'Critical';
  if (r >= 10) return 'High';
  if (r >= 7) return 'Medium';
  return 'Low';
}

// Create a simplified heatmap for activity patterns
async function createActivityHeatmap() {
  const container = document.getElementById('activityHeatmap');
  if (!container) return;
  
  try {
    // Get activity data from the adapter
    const activityData = await window.analyticsData.getStudyActivity();
    
    // Create a simplified visualization
    container.innerHTML = `
      <div class="simplified-heatmap">
        <div class="heatmap-header">
          <div class="heatmap-title">Weekly Activity Pattern</div>
        </div>
        <div class="heatmap-days">
          <div class="heatmap-day">
            <div class="day-label">Monday</div>
            <div class="hour-blocks">
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.2)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.3)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.1)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.7)"></div>
            </div>
          </div>
          <div class="heatmap-day">
            <div class="day-label">Tuesday</div>
            <div class="hour-blocks">
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.5)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.6)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.3)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.2)"></div>
            </div>
          </div>
          <div class="heatmap-day">
            <div class="day-label">Wednesday</div>
            <div class="hour-blocks">
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.1)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.3)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.2)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.5)"></div>
            </div>
          </div>
          <div class="heatmap-day">
            <div class="day-label">Thursday</div>
            <div class="hour-blocks">
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.2)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.8)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.7)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.6)"></div>
            </div>
          </div>
          <div class="heatmap-day">
            <div class="day-label">Friday</div>
            <div class="hour-blocks">
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.3)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.2)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.5)"></div>
              <div class="hour-block" style="background-color: rgba(89, 151, 172, 0.3)"></div>
            </div>
          </div>
        </div>
        <div class="heatmap-legend">
          <div class="legend-item"><div class="legend-color" style="background-color: rgba(89, 151, 172, 0.1)"></div><span>Low</span></div>
          <div class="legend-item"><div class="legend-color" style="background-color: rgba(89, 151, 172, 0.4)"></div><span>Medium</span></div>
          <div class="legend-item"><div class="legend-color" style="background-color: rgba(89, 151, 172, 0.8)"></div><span>High</span></div>
        </div>
      </div>
    `;
    
    // Update colors for night mode
    if (document.documentElement.getAttribute('data-theme') === 'night') {
      const hourBlocks = container.querySelectorAll('.hour-block');
      hourBlocks.forEach(block => {
        const style = block.getAttribute('style');
        if (style) {
          const newStyle = style.replace('rgba(89, 151, 172,', 'rgba(123, 181, 245,');
          block.setAttribute('style', newStyle);
        }
      });
    }
  } catch (error) {
    console.error('Error creating activity heatmap:', error);
    container.innerHTML = '<p class="chart-error">Unable to load activity data</p>';
  }
}