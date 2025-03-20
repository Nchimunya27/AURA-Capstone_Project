// Analytics functionality for Progress Analytics page
// This script handles dynamic data loading and visualization

// Track initialization state
let analyticsInitialized = false;
let chartsInitialized = false;
let allData = null;

// Main initialization function
async function initializeAnalytics() {
  // Prevent multiple initializations
  if (analyticsInitialized) return;
  
  console.log('Initializing analytics dashboard...');
  
  // Clear any hard-coded values from HTML first
  clearHardcodedValues();
  
  // Show loading state
  showLoadingState(true);
  
  try {
    // Initialize motivational quote
    initializeMotivationalQuote();
    
    // Load all data first
    await loadAllAnalyticsData();
    
    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
      // Set global chart defaults
      setChartGlobalDefaults();
      
      // Initialize and render all charts
      initializeCharts();
      
      // Update all analytics cards with data
      updateAllCards();
      
      // Mark as initialized
      analyticsInitialized = true;
    } else {
      console.warn('Chart.js is not loaded. Loading it dynamically...');
      // Try to load Chart.js
      await loadChartJS();
    }
  } catch (error) {
    console.error('Error initializing analytics dashboard:', error);
    // For demo purposes, we'll silently handle errors without showing error messages
    // Just use whatever data was successfully loaded
  } finally {
    // Hide loading state
    showLoadingState(false);
  }
}

// Clear any hard-coded values from HTML
function clearHardcodedValues() {
  // Clear KPI cards
  const kpiCards = document.querySelectorAll('.kpi-card');
  kpiCards.forEach(card => {
    const valueElement = card.querySelector('.kpi-value');
    const subtextElement = card.querySelector('.kpi-subtext');
    
    if (valueElement) valueElement.textContent = '—';
    if (subtextElement) subtextElement.textContent = 'Waiting for data';
  });
  
  // Clear chart legends
  const legendItems = document.querySelectorAll('.chart-legend .legend-text');
  legendItems.forEach(item => {
    item.textContent = 'Waiting for data';
  });
  
  // Clear quiz table
  const tableBody = document.querySelector('.analytics-table tbody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8">Waiting for quiz data</td>
      </tr>
    `;
  }
}

// Load all analytics data
async function loadAllAnalyticsData() {
  if (!window.analyticsData) {
    console.error('Analytics data adapter not found!');
    throw new Error('Analytics data adapter not found');
  }
  
  console.log('Loading analytics data...');
  
  try {
    // Get all data from the adapter in one call
    allData = await window.analyticsData.getAllAnalyticsData();
    console.log('Analytics data loaded successfully:', allData);
    return allData;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    throw error;
  }
}

// Initialize all charts
function initializeCharts() {
  if (chartsInitialized) return;
  
  console.log('Initializing charts with data...');
  
  // Clear any existing charts first
  clearExistingCharts();
  
  // Initialize each chart with data
  createStreakLineChart(allData.userProfile);
  createQuizStatusChart(allData.quizPerformance);
  createActivityBarChart(allData.studyActivity);
  createSkillRadarChart(allData.skillCoverage);
  
  chartsInitialized = true;
}

// Clear any existing charts before recreating them
function clearExistingCharts() {
  const chartCanvases = [
    'streakLineChart',
    'quizStatusChart', 
    'activityBarChart',
    'skillCoverageChart'
  ];
  
  chartCanvases.forEach(canvasId => {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      // Get the chart instance if it exists
      const chartInstance = Chart.getChart(canvas);
      if (chartInstance) {
        // Destroy the existing chart
        chartInstance.destroy();
      }
    }
  });
}

// Update all cards and tables with data
function updateAllCards() {
  console.log('Updating all analytics cards with data...');
  
  // Update KPI cards
  updateKPICards();
  
  // Update quiz performance table
  updateQuizTable();
}

// Update KPI cards with real data
function updateKPICards() {
  // Update course progress card
  const progressCard = document.querySelector('.kpi-card:nth-child(1)');
  if (progressCard && allData.courseProgress) {
    progressCard.querySelector('.kpi-value').textContent = `${allData.courseProgress.overallPercentage}%`;
    progressCard.querySelector('.kpi-subtext').textContent = 
      `${allData.courseProgress.modulesCompleted} of ${allData.courseProgress.totalModules} modules completed`;
  } else if (progressCard) {
    progressCard.querySelector('.kpi-value').textContent = '—';
    progressCard.querySelector('.kpi-subtext').textContent = 'No data available';
  }
  
  // Update current streak card
  const currentStreakCard = document.querySelector('.kpi-card:nth-child(2)');
  if (currentStreakCard && allData.userProfile) {
    currentStreakCard.querySelector('.kpi-value').textContent = allData.userProfile.currentStreak;
    currentStreakCard.querySelector('.kpi-subtext').textContent = 'days in a row';
  } else if (currentStreakCard) {
    currentStreakCard.querySelector('.kpi-value').textContent = '—';
    currentStreakCard.querySelector('.kpi-subtext').textContent = 'No data available';
  }
  
  // Update longest streak card
  const longestStreakCard = document.querySelector('.kpi-card:nth-child(3)');
  if (longestStreakCard && allData.userProfile) {
    longestStreakCard.querySelector('.kpi-value').textContent = allData.userProfile.longestStreak;
    longestStreakCard.querySelector('.kpi-subtext').textContent = 'days';
  } else if (longestStreakCard) {
    longestStreakCard.querySelector('.kpi-value').textContent = '—';
    longestStreakCard.querySelector('.kpi-subtext').textContent = 'No data available';
  }
  
  // Update study time card
  const studyTimeCard = document.querySelector('.kpi-card:nth-child(4)');
  if (studyTimeCard && allData.userProfile) {
    studyTimeCard.querySelector('.kpi-value').textContent = `${allData.userProfile.totalStudyHours}h`;
    studyTimeCard.querySelector('.kpi-subtext').textContent = 'total hours';
  } else if (studyTimeCard) {
    studyTimeCard.querySelector('.kpi-value').textContent = '—';
    studyTimeCard.querySelector('.kpi-subtext').textContent = 'No data available';
  }
}

// Update quiz table with real data
function updateQuizTable() {
  const tableBody = document.querySelector('.analytics-table tbody');
  if (!tableBody) return;
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // Check if we have quiz data
  if (!allData.quizPerformance || !allData.quizPerformance.recentQuizzes || allData.quizPerformance.recentQuizzes.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8">No quiz data available</td>
      </tr>
    `;
    return;
  }
  
  // Add rows for each quiz
  allData.quizPerformance.recentQuizzes.forEach(quiz => {
    const row = document.createElement('tr');
    
    // Quiz name
    const nameCell = document.createElement('td');
    nameCell.textContent = quiz.name;
    row.appendChild(nameCell);
    
    // Date completed
    const dateCell = document.createElement('td');
    dateCell.textContent = quiz.date ? formatDate(quiz.date) : '-';
    row.appendChild(dateCell);
    
    // Score
    const scoreCell = document.createElement('td');
    scoreCell.textContent = quiz.score !== null ? `${quiz.score}%` : '-';
    row.appendChild(scoreCell);
    
    // Time spent
    const timeCell = document.createElement('td');
    timeCell.textContent = quiz.timeSpent !== null ? `${quiz.timeSpent} min` : '-';
    row.appendChild(timeCell);
    
    // Status
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${quiz.status}`;
    statusBadge.textContent = quiz.status === 'completed' ? 'Completed' : 'Pending';
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    tableBody.appendChild(row);
  });
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '-';
  
  // If it's already a formatted string and not a date object, return as is
  if (typeof dateString === 'string' && !dateString.includes('T') && !dateString.includes('-')) {
    return dateString;
  }
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  } catch (e) {
    console.warn('Error formatting date:', e);
    return dateString;
  }
}

// Enhanced Streak Line Chart
function createStreakLineChart(userData) {
  const ctx = document.getElementById('streakLineChart');
  if (!ctx) return;
  
  // Generate empty streak data
  const streakData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14', 'Day 15'],
    datasets: [{
      label: 'Daily Streak',
      data: Array(15).fill(0),
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
function createQuizStatusChart(quizData) {
  const ctx = document.getElementById('quizStatusChart');
  if (!ctx) return;
  
  // Empty donut chart data
  const chartData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [0, 1], // Default to 0% completion for empty state
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
    chartData.datasets[0].backgroundColor[0] = 'rgba(123, 181, 245, 1)';
    chartData.datasets[0].backgroundColor[1] = '#31456e';
  }
  
  // Update the legend text to show empty state
  const legendItems = document.querySelectorAll('.chart-legend .legend-text');
  if (legendItems && legendItems.length >= 2) {
    legendItems[0].textContent = 'Completed (0/0)';
    legendItems[1].textContent = 'Pending (0/0)';
  }
  
  // Create the chart
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
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
              const totalValue = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
              return `${label}: ${value} out of ${totalValue} (${percentage}%)`;
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
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
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
function createActivityBarChart(activityData) {
  const ctx = document.getElementById('activityBarChart');
  if (!ctx) return;
  
  // Show "Waiting for data" message instead of empty chart
  showChartPlaceholder(ctx, 'Waiting for data');
}

// Create radar chart for skill coverage
function createSkillRadarChart(skillData) {
  const ctx = document.getElementById('skillCoverageChart');
  if (!ctx) return;
  
  // Show "Waiting for data" message instead of empty chart
  showChartPlaceholder(ctx, 'Waiting for data');
}

// Show placeholder for empty charts
function showChartPlaceholder(canvas, message) {
  const parent = canvas.parentElement;
  const placeholderDiv = document.createElement('div');
  placeholderDiv.className = 'chart-placeholder';
  placeholderDiv.textContent = message;
  
  // Style the placeholder
  placeholderDiv.style.display = 'flex';
  placeholderDiv.style.alignItems = 'center';
  placeholderDiv.style.justifyContent = 'center';
  placeholderDiv.style.height = '100%';
  placeholderDiv.style.width = '100%';
  placeholderDiv.style.color = document.documentElement.getAttribute('data-theme') === 'night' 
    ? 'rgba(255, 255, 255, 0.6)' 
    : 'rgba(0, 0, 0, 0.5)';
  placeholderDiv.style.fontSize = '16px';
  placeholderDiv.style.fontWeight = '500';
  
  // Clear the parent and add the placeholder
  parent.innerHTML = '';
  parent.appendChild(placeholderDiv);
}

// Create motivational quote functionality
function initializeMotivationalQuote() {
  const quoteContainer = document.querySelector('.motivational-quote-container');
  if (!quoteContainer) return;
  
  // Array of motivational quotes
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Continuous learning is the minimum requirement for success in any field.", author: "Brian Tracy" },
    { text: "Education is not the filling of a pail, but the lighting of a fire.", author: "W.B. Yeats" },
    { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "Learning is not attained by chance, it must be sought for with ardor and diligence.", author: "Abigail Adams" },
    { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" }
  ];
  
  // Select a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  // Generate quote HTML
  quoteContainer.innerHTML = `
    <div class="quote-content quote-fade-in">
      <div class="quote-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 11H6.21C6.07 11 5.98 10.88 6.04 10.76C7.13 8.38 9.39 6.7 12 6.18V5C7.66 5.63 4.34 9.17 4.03 13.59C4.01 14.17 4.27 14.66 4.75 14.89C5.04 15.03 5.39 15.05 5.7 14.95C6.53 14.67 7.34 15.24 7.36 16.12C7.39 17.13 6.56 17.95 5.56 17.92C4.18 17.88 3 16.68 3 15.3V15.28C3 7.96 9.89 6.5 12 6.5V11L10 11Z" fill="white"/>
          <path d="M22 15.3C22 7.96 15.11 6.5 13 6.5V11H16.79C16.93 11 17.02 10.88 16.96 10.76C15.87 8.38 13.61 6.7 11 6.18V5C15.34 5.63 18.66 9.17 18.97 13.59C18.99 14.17 18.73 14.66 18.25 14.89C17.96 15.03 17.61 15.05 17.3 14.95C16.47 14.67 15.66 15.24 15.64 16.12C15.61 17.13 16.44 17.95 17.44 17.92C18.82 17.88 20 16.68 20 15.3H22Z" fill="white"/>
        </svg>
      </div>
      <div class="quote-text">${randomQuote.text}</div>
      <div class="quote-author">— ${randomQuote.author}</div>
    </div>
  `;
}

// Function to load Chart.js dynamically if it's not already available
async function loadChartJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = function() {
      console.log('Chart.js loaded successfully');
      setChartGlobalDefaults();
      initializeCharts();
      resolve();
    };
    script.onerror = function() {
      console.error('Failed to load Chart.js');
      reject(new Error('Failed to load Chart.js'));
    };
    document.head.appendChild(script);
  });
}

// Show loading state
function showLoadingState(isLoading) {
  let loadingElement = document.getElementById('analytics-loading');
  
  if (isLoading) {
    if (!loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.id = 'analytics-loading';
      loadingElement.className = 'analytics-loading';
      loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <div>Retrieving analytics data</div>
      `;
      
      // Add loading styles if not already in document
      if (!document.getElementById('loading-styles')) {
        const style = document.createElement('style');
        style.id = 'loading-styles';
        style.textContent = `
          .analytics-loading {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-size: 16px;
            color: var(--text-primary, #000000);
          }
          
          [data-theme="night"] .analytics-loading {
            background: rgba(0, 0, 0, 0.7);
            color: var(--text-primary, #ffffff);
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            margin-bottom: 16px;
            border: 4px solid rgba(89, 151, 172, 0.3);
            border-radius: 50%;
            border-top-color: rgba(89, 151, 172, 1);
            animation: spin 1s linear infinite;
          }
          
          [data-theme="night"] .loading-spinner {
            border: 4px solid rgba(123, 181, 245, 0.3);
            border-top-color: rgba(123, 181, 245, 1);
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      
      // Find the main content area
      const mainContent = document.querySelector('.analytics-main');
      if (mainContent) {
        mainContent.appendChild(loadingElement);
      } else {
        document.body.appendChild(loadingElement);
      }
    }
  } else {
    // Remove loading element if it exists
    if (loadingElement) {
      loadingElement.remove();
    }
  }
}

// Show error state
function showErrorState(message) {
  let errorElement = document.getElementById('analytics-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'analytics-error';
    errorElement.className = 'analytics-error';
    errorElement.innerHTML = `
      <div class="error-icon">⚠️</div>
      <div class="error-message">${message}</div>
      <button class="error-retry" onclick="initializeAnalytics()">Retry</button>
    `;
    
    // Add error styles if not already in document
    if (!document.getElementById('error-styles')) {
      const style = document.createElement('style');
      style.id = 'error-styles';
      style.textContent = `
        .analytics-error {
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          padding: 16px 20px;
          margin: 20px 0;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        [data-theme="night"] .analytics-error {
          background-color: rgba(239, 68, 68, 0.2);
        }
        
        .error-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
        
        .error-message {
          color: #b91c1c;
          font-size: 14px;
          margin-bottom: 12px;
        }
        
        [data-theme="night"] .error-message {
          color: #fca5a5;
        }
        
        .error-retry {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .error-retry:hover {
          background-color: #dc2626;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Find the main content area
    const mainContent = document.querySelector('.analytics-main');
    if (mainContent) {
      mainContent.appendChild(errorElement);
    } else {
      document.body.appendChild(errorElement);
    }
  } else {
    // Update error message
    errorElement.querySelector('.error-message').textContent = message;
  }
}

// Set global chart defaults for consistent styling
function setChartGlobalDefaults() {
  if (typeof Chart === 'undefined') return;
  
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

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeAnalytics();
});

// Listen for theme changes to update charts
document.addEventListener('themeChanged', function() {
  // If charts are already initialized, recreate them with the new theme
  if (chartsInitialized && allData) {
    // Reset charts
    chartsInitialized = false;
    
    // Set new chart defaults
    setChartGlobalDefaults();
    
    // Reinitialize charts
    initializeCharts();
  }
});