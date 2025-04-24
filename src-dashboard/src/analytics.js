// analytics.js
// Handles updating the UI with analytics data

document.addEventListener('DOMContentLoaded', initializeAnalytics);

// Global state to track feature flags and user preferences
const analyticsState = {
  isInitialized: false,
  refreshInterval: null,
  autoRefreshEnabled: false,
  autoRefreshInterval: 5 * 60 * 1000, // 5 minutes
  filterPeriod: 'all', // 'week', 'month', 'year', 'all'
  chartsInitialized: false,
  darkMode: false,
  userSettings: {},
  studyTimeInterval: null,
};

// Main initialization function
async function initializeAnalytics() {
  try {
    // Clean up any existing intervals
    cleanupAnalytics();
    
    // Check for theme preference
    analyticsState.darkMode = document.documentElement.getAttribute('data-theme') === 'night';
    
    // Create refresh button if it doesn't exist
    createRefreshButton();
    
    // Create time period filters
    createTimePeriodFilters();
    
    // Load motivational quote
    await loadMotivationalQuote();
    
    // Show loading state
    showLoadingState();
    
    // Load analytics data
    const data = await window.analyticsData.getAllAnalyticsData();
    
    // Update the UI with the data
    updateKPICards(data);
    initializeCharts(data);
    updateQuizTable(data.quizPerformance);
    
    // Hide loading state
    hideLoadingState();
    
    // Set up event listeners for data updates
    setupDataUpdateListeners();
    
    // Set up theme change detection
    setupThemeChangeDetection();
    
    // Mark as initialized
    analyticsState.isInitialized = true;
    
  } catch (error) {
    console.error('Error initializing analytics:', error);
    hideLoadingState();
    showErrorMessage('Failed to load analytics data. Please try again later.');
  }
}

// Create refresh button in the analytics header
function createRefreshButton() {
  const header = document.querySelector('.analytics-heading');
  
  // Check if button already exists
  if (document.querySelector('.refresh-analytics-btn')) {
    return;
  }
  
  // Create container for controls
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'analytics-controls';
  
  // Create refresh button
  const refreshButton = document.createElement('button');
  refreshButton.className = 'refresh-analytics-btn';
  refreshButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
    <span>Refresh</span>
  `;
  refreshButton.addEventListener('click', window.refreshAnalytics);
  
  // Add auto-refresh toggle
  const autoRefreshLabel = document.createElement('label');
  autoRefreshLabel.className = 'auto-refresh-toggle';
  autoRefreshLabel.innerHTML = `
    <input type="checkbox" id="auto-refresh-toggle">
    <span>Auto-refresh</span>
  `;
  
  // Add event listener for auto-refresh toggle
  const autoRefreshToggle = autoRefreshLabel.querySelector('#auto-refresh-toggle');
  autoRefreshToggle.addEventListener('change', function() {
    toggleAutoRefresh(this.checked);
  });
  
  // Add to controls container
  controlsContainer.appendChild(refreshButton);
  controlsContainer.appendChild(autoRefreshLabel);
  
  // Add controls next to the heading
  header.parentNode.insertBefore(controlsContainer, header.nextSibling);
}

// Create time period filter controls
function createTimePeriodFilters() {
  const analyticsSection = document.querySelector('.analytics-section');
  
  // Check if filters already exist
  if (document.querySelector('.time-period-filters')) {
    return;
  }
  
  // Create filter container
  const filterContainer = document.createElement('div');
  filterContainer.className = 'time-period-filters';
  
  // Create filter label
  const filterLabel = document.createElement('span');
  filterLabel.className = 'filter-label';
  filterLabel.textContent = 'Show data for:';
  filterContainer.appendChild(filterLabel);
  
  // Create filter options
  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];
  
  // Create filter buttons
  const filterButtons = document.createElement('div');
  filterButtons.className = 'filter-buttons';
  
  periods.forEach(period => {
    const button = document.createElement('button');
    button.className = `filter-btn ${period.id === analyticsState.filterPeriod ? 'active' : ''}`;
    button.dataset.period = period.id;
    button.textContent = period.label;
    
    button.addEventListener('click', function() {
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update filter period and refresh data
      analyticsState.filterPeriod = this.dataset.period;
      applyTimePeriodFilter();
    });
    
    filterButtons.appendChild(button);
  });
  
  filterContainer.appendChild(filterButtons);
  
  // Insert after analytics heading
  const targetElement = document.querySelector('.analytics-controls') || document.querySelector('.analytics-heading');
  targetElement.parentNode.insertBefore(filterContainer, targetElement.nextSibling);
}

// Apply time period filter to the data
async function applyTimePeriodFilter() {
  showLoadingState();
  
  try {
    // Refresh data with filter applied
    const data = await window.analyticsData.getAllAnalyticsData(true);
    
    // Filter the data based on selected time period
    const filteredData = filterDataByTimePeriod(data, analyticsState.filterPeriod);
    
    // Update UI with filtered data
    updateKPICards(filteredData);
    // Charts need to be destroyed and recreated to properly update
    destroyCharts();
    initializeCharts(filteredData);
    updateQuizTable(filteredData.quizPerformance);
    
    hideLoadingState();
    
  } catch (error) {
    console.error('Error applying time period filter:', error);
    hideLoadingState();
    showToast('Failed to update data for selected time period.', 'error');
  }
}

// Filter data based on time period
function filterDataByTimePeriod(data, period) {
  // Clone the data to avoid modifying the original
  const filteredData = JSON.parse(JSON.stringify(data));
  
  // Get date boundaries for the selected period
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'week':
      // Start of current week (Sunday)
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      // Start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      // Start of current year
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
    default:
      // No filtering needed
      return filteredData;
  }
  
  // Filter quiz performance data
  if (filteredData.quizPerformance && filteredData.quizPerformance.recentQuizzes) {
    filteredData.quizPerformance.recentQuizzes = filteredData.quizPerformance.recentQuizzes.filter(quiz => {
      if (!quiz.date) return false;
      const quizDate = new Date(quiz.date);
      return quizDate >= startDate;
    });
    
    // Update completed/pending counts
    filteredData.quizPerformance.completed = filteredData.quizPerformance.recentQuizzes.filter(q => q.status === 'completed').length;
    filteredData.quizPerformance.pending = filteredData.quizPerformance.totalQuizzes - filteredData.quizPerformance.completed;
  }
  
  // Filter study activity data
  if (filteredData.studyActivity) {
    // Filter activity heatmap
    if (filteredData.studyActivity.activityHeatmap) {
      // This would depend on how your heatmap data is structured
      // For this example, we'll assume that we don't filter the heatmap
    }
    
    // Weekly hours - no filter needed as it's already weekly
  }
  
  return filteredData;
}

// Toggle auto-refresh functionality
function toggleAutoRefresh(enabled) {
  analyticsState.autoRefreshEnabled = enabled;
  
  // Clear existing interval if any
  if (analyticsState.refreshInterval) {
    clearInterval(analyticsState.refreshInterval);
    analyticsState.refreshInterval = null;
  }
  
  // Set up new interval if enabled
  if (enabled) {
    analyticsState.refreshInterval = setInterval(async () => {
      await window.refreshAnalytics();
    }, analyticsState.autoRefreshInterval);
    
    showToast('Auto-refresh enabled. Data will refresh every 5 minutes.', 'info');
  } else {
    showToast('Auto-refresh disabled.', 'info');
  }
}

// Setup theme change detection
function setupThemeChangeDetection() {
  // Create a MutationObserver to watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const newTheme = document.documentElement.getAttribute('data-theme');
        if ((newTheme === 'night') !== analyticsState.darkMode) {
          analyticsState.darkMode = (newTheme === 'night');
          
          // Update charts for the new theme
          if (analyticsState.chartsInitialized) {
            // Refresh charts with new theme colors
            window.refreshAnalytics();
          }
        }
      }
    });
  });
  
  // Start observing the document element for theme changes
  observer.observe(document.documentElement, { attributes: true });
}

// Show loading indicators for all charts
function showLoadingState() {
  const chartContainers = document.querySelectorAll('.chart-container');
  chartContainers.forEach(container => {
    // Check if loading indicator already exists
    if (!container.querySelector('.chart-loading')) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'chart-loading';
      loadingDiv.innerHTML = '<div class="spinner"></div><div>Loading data...</div>';
      container.appendChild(loadingDiv);
    } else {
      container.querySelector('.chart-loading').style.display = 'flex';
    }
  });
}

// Hide all loading indicators
function hideLoadingState() {
  const loadingIndicators = document.querySelectorAll('.chart-loading');
  loadingIndicators.forEach(indicator => {
    indicator.style.display = 'none';
  });
}

// Update the KPI cards with the latest data
function updateKPICards(data) {
  const { userProfile, courseProgress } = data;
  
  // Course Progress KPI
  document.getElementById('course-progress-percentage').textContent = `${courseProgress.overallPercentage}%`;
  document.getElementById('course-progress-modules').textContent = 
    `${courseProgress.modulesCompleted} of ${courseProgress.totalModules} modules completed`;
  
  // Current Streak KPI
  document.getElementById('current-streak-value').textContent = userProfile.currentStreak;
  
  // Longest Streak KPI
  document.getElementById('longest-streak-value').textContent = userProfile.longestStreak;
  
  // Study Time KPI - Format with one decimal place
  const studyTimeElement = document.getElementById('study-time-value');
  studyTimeElement.textContent = `${userProfile.totalStudyHours}h`;
  
  // Start periodic updates of study time if not already started
  if (!analyticsState.studyTimeInterval) {
    analyticsState.studyTimeInterval = setInterval(() => {
      const currentStudyHours = window.analyticsData.getStudyTime();
      studyTimeElement.textContent = `${currentStudyHours}h`;
    }, 1000); // Update every second
  }
}

// Initialize chart visualizations
function initializeCharts(data) {
  const { userProfile, studyActivity, quizPerformance, skillCoverage } = data;
  
  // Initialize Streak Line Chart
  initializeStreakLineChart(userProfile);
  
  // Initialize Quiz Status Chart
  initializeQuizStatusChart(quizPerformance);
  
  // Initialize Activity Bar Chart
  initializeActivityBarChart(studyActivity);
  
  // Initialize Skill Coverage Chart
  initializeSkillCoverageChart(skillCoverage);
}

// Initialize the streak line chart
function initializeStreakLineChart(userData) {
  const ctx = document.getElementById('streakLineChart').getContext('2d');
  
  // Generate streak data based on user activity
  const streakData = generateStreakData(userData);
  
  // Get theme colors
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#5997AC';
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'night';
  
  // Create the chart
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: streakData.labels,
      datasets: [{
        label: 'Daily Streak',
        data: streakData.values,
        backgroundColor: `rgba(${hexToRgb(accentColor)}, 0.2)`,
        borderColor: accentColor,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: accentColor,
        tension: 0.2,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          labels: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
          bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          callbacks: {
            title: function(tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y + ' days';
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Streak (days)',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'
          },
          ticks: {
            stepSize: 1,
            precision: 0,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
          }
        }
      }
    }
  });
  
  // Store chart instance reference
  Chart.streakLineChart = chart;
  
  // Mark charts as initialized
  analyticsState.chartsInitialized = true;
}

// Generate streak data from user data
function generateStreakData(userData) {
  // Generate last 30 days of streak data for the chart
  const labels = [];
  const values = [];
  
  // Current date
  const today = new Date();
  
  // Get actual streak data if available
  const hasStreakHistory = userData.streakHistory && Array.isArray(userData.streakHistory) && userData.streakHistory.length > 0;
  
  // Generate dates for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Format date as 'MMM DD' (e.g., 'Apr 01')
    const formatDate = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    labels.push(formatDate);
    
    if (hasStreakHistory) {
      // Use real streak history data if available
      const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      const streakEntry = userData.streakHistory.find(entry => entry.date === dateStr);
      values.push(streakEntry ? streakEntry.streakCount : 0);
    } else {
      // Generate synthetic streak data if no history available
      let streakValue = 0;
      if (i <= 29 - 30 + userData.streakCount) {
        streakValue = i - (29 - 30 + userData.streakCount) + 1;
      }
      values.push(Math.max(0, streakValue));
    }
  }
  
  return { labels, values };
}

// Initialize quiz status doughnut chart
function initializeQuizStatusChart(quizData) {
  const ctx = document.getElementById('quizStatusChart').getContext('2d');
  
  // Get theme-aware colors
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#5997AC';
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'night';
  const pendingColor = isDarkMode ? '#31456e' : '#e5e7eb';
  
  // Ensure we have valid data
  const completed = typeof quizData.completed === 'number' ? quizData.completed : 0;
  const pending = typeof quizData.pending === 'number' ? quizData.pending : 0;
  const total = completed + pending;
  
  // Skip chart if no data
  if (total === 0) {
    // Display a message instead of an empty chart
    const container = document.getElementById('quizStatusChart').parentNode;
    const noDataMsg = document.createElement('div');
    noDataMsg.className = 'no-data-message';
    noDataMsg.textContent = 'No quiz data available yet';
    container.innerHTML = '';
    container.appendChild(noDataMsg);
    
    // Update legend text to show zero values
    updateQuizLegend(0, 0, 0);
    return;
  }
  
  // Create the chart
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        data: [completed, pending],
        backgroundColor: [accentColor, pendingColor],
        borderWidth: 0,
        hoverOffset: 4,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          display: false,
          labels: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
          bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value}/${total} (${percentage}%)`;
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
  
  // Add a center text plugin if not already present
  if (!chart.centerTextPlugin) {
    chart.centerTextPlugin = {
      id: 'centerText',
      afterDraw: function(chart) {
        const width = chart.width;
        const height = chart.height;
        const ctx = chart.ctx;
        
        ctx.restore();
        const fontSize = (height / 114).toFixed(2);
        ctx.font = fontSize + 'em sans-serif';
        ctx.textBaseline = 'middle';
        
        const text = `${Math.round((completed / total) * 100)}%`;
        const textX = Math.round((width - ctx.measureText(text).width) / 2);
        const textY = height / 2;
        
        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
        ctx.fillText(text, textX, textY);
        ctx.save();
      }
    };
    
    // Register the plugin
    Chart.register(chart.centerTextPlugin);
  }
  
  // Update legend text
  updateQuizLegend(completed, pending, quizData.totalQuizzes);
  
  // Store chart instance reference
  Chart.quizStatusChart = chart;
}

// Update the quiz legend text
function updateQuizLegend(completed, pending, total) {
  // Use the actual total if provided, otherwise use the sum
  const actualTotal = total || (completed + pending);
  
  // Safely update the legend texts
  const completedLegend = document.querySelector('.chart-legend .legend-item:first-child .legend-text');
  const pendingLegend = document.querySelector('.chart-legend .legend-item:last-child .legend-text');
  
  if (completedLegend) {
    completedLegend.textContent = `Completed (${completed}/${actualTotal})`;
  }
  
  if (pendingLegend) {
    pendingLegend.textContent = `Pending (${pending}/${actualTotal})`;
  }
}

// Initialize activity by day bar chart
function initializeActivityBarChart(activityData) {
  const ctx = document.getElementById('activityBarChart').getContext('2d');
  
  // Get theme-aware colors
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#5997AC';
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'night';
  
  // Day labels
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Process the weekly hours data to handle missing days or null values
  const weeklyHours = processWeeklyHoursData(activityData.weeklyHours);
  
  // Calculate peak day for highlighting
  const peakDayIndex = findPeakDayIndex(weeklyHours);
  
  // Generate colors with peak day highlighted
  const barColors = weeklyHours.map((_, index) => {
    if (index === peakDayIndex) {
      // Highlight peak day
      return accentColor;
    } else {
      // Use a lighter shade for other days
      const rgb = hexToRgb(accentColor);
      return `rgba(${rgb}, 0.6)`;
    }
  });
  
  // Create the chart
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dayLabels,
      datasets: [{
        label: 'Hours Studied',
        data: weeklyHours,
        backgroundColor: barColors,
        borderRadius: 4,
        maxBarThickness: 40,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
          bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            label: function(context) {
              const value = context.parsed.y || 0;
              const formattedValue = value.toFixed(1);
              return `${formattedValue} hour${formattedValue !== '1.0' ? 's' : ''}`;
            },
            afterLabel: function(context) {
              const value = context.parsed.y || 0;
              const total = weeklyHours.reduce((acc, curr) => acc + curr, 0);
              if (total > 0) {
                const percentage = Math.round((value / total) * 100);
                return `${percentage}% of weekly total`;
              }
              return '';
            }
          }
        },
        annotation: {
          annotations: {
            line1: {
              type: 'line',
              yMin: calculateAverageDailyHours(weeklyHours),
              yMax: calculateAverageDailyHours(weeklyHours),
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              borderWidth: 1,
              borderDash: [5, 5],
              label: {
                content: 'Average',
                enabled: true,
                position: 'end',
                backgroundColor: 'transparent',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                font: {
                  size: 11
                }
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)'
          },
          ticks: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            callback: function(value) {
              return value.toFixed(1);
            }
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
          }
        }
      }
    }
  });
  
  // Add an annotation plugin if it's not registered yet
  if (!chart.annotationsRegistered) {
    // Create a simple annotation plugin
    const annotationPlugin = {
      id: 'customAnnotations',
      afterDraw: function(chart) {
        const ctx = chart.ctx;
        const yAxis = chart.scales.y;
        const xAxis = chart.scales.x;
        const avg = calculateAverageDailyHours(weeklyHours);
        
        if (avg > 0) {
          const y = yAxis.getPixelForValue(avg);
          
          // Draw dashed line
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 1;
          ctx.moveTo(xAxis.left, y);
          ctx.lineTo(xAxis.right, y);
          ctx.stroke();
          
          // Draw label
          ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`Average: ${avg.toFixed(1)}h`, xAxis.right - 5, y - 5);
          ctx.restore();
        }
      }
    };
    
    // Register the plugin
    Chart.register(annotationPlugin);
    chart.annotationsRegistered = true;
  }
  
  // Store chart instance reference
  Chart.activityBarChart = chart;
  
  // Add a note about the peak day if we have valid data
  if (peakDayIndex !== -1) {
    const chartCard = document.getElementById('activityBarChart').closest('.chart-card');
    let chartNote = chartCard.querySelector('.chart-note');
    
    if (!chartNote) {
      chartNote = document.createElement('div');
      chartNote.className = 'chart-note';
      chartCard.appendChild(chartNote);
    }
    
    chartNote.textContent = `Your most productive day is ${dayLabels[peakDayIndex]} with ${weeklyHours[peakDayIndex].toFixed(1)} hours.`;
  }
}

// Process weekly hours data to handle missing or invalid values
function processWeeklyHoursData(weeklyHours) {
  // Check if we have valid weekly hours data
  if (!weeklyHours || !Array.isArray(weeklyHours) || weeklyHours.length === 0) {
    // Return default array with zeros for 7 days
    return [0, 0, 0, 0, 0, 0, 0];
  }
  
  // Ensure we have exactly 7 days
  const processed = Array(7).fill(0);
  
  // Copy valid values
  for (let i = 0; i < Math.min(weeklyHours.length, 7); i++) {
    processed[i] = typeof weeklyHours[i] === 'number' && !isNaN(weeklyHours[i]) 
      ? weeklyHours[i] 
      : 0;
  }
  
  return processed;
}

// Find the peak day index from weekly hours data
function findPeakDayIndex(weeklyHours) {
  if (!weeklyHours || weeklyHours.length === 0) {
    return -1;
  }
  
  let maxValue = -1;
  let maxIndex = -1;
  
  weeklyHours.forEach((hours, index) => {
    if (hours > maxValue) {
      maxValue = hours;
      maxIndex = index;
    }
  });
  
  // Only return a peak day if there's actual activity
  return maxValue > 0 ? maxIndex : -1;
}

// Calculate average daily hours from weekly data
function calculateAverageDailyHours(weeklyHours) {
  if (!weeklyHours || weeklyHours.length === 0) {
    return 0;
  }
  
  const total = weeklyHours.reduce((acc, curr) => acc + curr, 0);
  return total / weeklyHours.length;
}

// Initialize skill coverage radar chart
function initializeSkillCoverageChart(skillData) {
  const ctx = document.getElementById('skillCoverageChart').getContext('2d');
  
  // Get theme-aware colors
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#5997AC';
  const accentRgb = hexToRgb(accentColor);
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'night';
  
  // Process and validate skill data
  const processedData = processSkillData(skillData);
  
  // Check if we have valid data
  if (processedData.labels.length === 0) {
    // Display a message instead of an empty chart
    const container = document.getElementById('skillCoverageChart').parentNode;
    const noDataMsg = document.createElement('div');
    noDataMsg.className = 'no-data-message';
    noDataMsg.textContent = 'No skill data available yet';
    container.innerHTML = '';
    container.appendChild(noDataMsg);
    return;
  }
  
  // Create the chart
  const chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: processedData.labels,
      datasets: [
        {
          label: 'Your Score',
          data: processedData.userScores,
          backgroundColor: `rgba(${accentRgb}, 0.2)`,
          borderColor: accentColor,
          borderWidth: 2,
          pointBackgroundColor: accentColor,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: accentColor
        },
        {
          label: 'Course Average',
          data: processedData.courseAverages,
          backgroundColor: isDarkMode ? 'rgba(200, 200, 200, 0.1)' : 'rgba(120, 120, 120, 0.1)',
          borderColor: isDarkMode ? 'rgba(200, 200, 200, 0.7)' : 'rgba(120, 120, 120, 0.7)',
          borderWidth: 1,
          pointBackgroundColor: isDarkMode ? 'rgba(200, 200, 200, 0.7)' : 'rgba(120, 120, 120, 0.7)',
          pointRadius: 2,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          grid: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            backdropColor: 'transparent',
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
          },
          pointLabels: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
            font: {
              size: 11
            }
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.85)',
            usePointStyle: true,
            pointStyleWidth: 10
          }
        },
        tooltip: {
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
          bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
          callbacks: {
            title: function(tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.r !== null) {
                label += context.parsed.r + '%';
              }
              return label;
            },
            afterBody: function(tooltipItems) {
              const skillName = tooltipItems[0].label;
              const userScore = tooltipItems[0].raw;
              const courseAvg = tooltipItems[1].raw;
              
              if (userScore > courseAvg) {
                const diff = userScore - courseAvg;
                return `You're ${diff.toFixed(0)}% above average!`;
              } else if (userScore < courseAvg) {
                const diff = courseAvg - userScore;
                return `${diff.toFixed(0)}% below average - keep practicing!`;
              } else {
                return 'Doing great! You are right at the course average!';
              }
            }
          }
        }
      }
    }
  });
  
  // Store chart instance reference
  Chart.skillCoverageChart = chart;
  
  // Add a note about strengths and areas for improvement if available
  const chartCard = document.getElementById('skillCoverageChart').closest('.chart-card');
  let chartNote = chartCard.querySelector('.chart-note');
  
  if (!chartNote) {
    chartNote = document.createElement('div');
    chartNote.className = 'chart-note skill-insights';
    chartCard.appendChild(chartNote);
  }
  
  // Build insights text
  let insightsHtml = '';
  
  if (skillData.strengths && skillData.strengths.length > 0) {
    insightsHtml += `<span class="insight-label">Strengths:</span> ${skillData.strengths.join(', ')}`;
  }
  
  if (skillData.areasForImprovement && skillData.areasForImprovement.length > 0) {
    if (insightsHtml) insightsHtml += '<br>';
    insightsHtml += `<span class="insight-label">Areas to improve:</span> ${skillData.areasForImprovement.join(', ')}`;
  }
  
  if (insightsHtml) {
    chartNote.innerHTML = insightsHtml;
  } else {
    chartNote.innerHTML = '<em>Keep learning to reveal your skill insights!</em>';
  }
}

// Process and validate skill data
function processSkillData(skillData) {
  const result = {
    labels: [],
    userScores: [],
    courseAverages: []
  };
  
  // Check if we have valid skill data
  if (!skillData || !skillData.skills || !Array.isArray(skillData.skills) || skillData.skills.length === 0) {
    return result;
  }
  
  // Process each skill
  skillData.skills.forEach(skill => {
    // Validate individual skill data
    if (skill && skill.name && typeof skill.userScore === 'number' && typeof skill.courseAverage === 'number') {
      result.labels.push(skill.name);
      result.userScores.push(skill.userScore);
      result.courseAverages.push(skill.courseAverage);
    }
  });
  
  return result;
}

// Update quiz performance table
function updateQuizTable(quizData) {
  const tableContainer = document.querySelector('.analytics-table').parentNode;
  const table = document.querySelector('.analytics-table');
  const tableBody = table.querySelector('tbody');
  
  // Check if we have quiz data
  if (!quizData || !quizData.recentQuizzes || !Array.isArray(quizData.recentQuizzes) || quizData.recentQuizzes.length === 0) {
    // Show a message if no quiz data
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <div class="empty-state-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="13" y2="17"/>
            </svg>
            <p>No quiz data available yet. Complete quizzes to see your performance here.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // Sort quizzes by date (completed first, then most recent first)
  const sortedQuizzes = [...quizData.recentQuizzes].sort((a, b) => {
    // Completed quizzes first
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (a.status !== 'completed' && b.status === 'completed') return 1;
    
    // If both have same status, sort by date
    if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date); // Most recent first
    }
    
    // If one has date and other doesn't
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    
    // If neither has date, sort by name
    return a.name.localeCompare(b.name);
  });
  
  // Add recent quizzes to the table
  sortedQuizzes.forEach(quiz => {
    const row = document.createElement('tr');
    row.className = quiz.status === 'completed' ? 'completed-quiz' : 'pending-quiz';
    
    // Quiz name
    const nameCell = document.createElement('td');
    nameCell.className = 'quiz-name-cell';
    nameCell.textContent = quiz.name;
    row.appendChild(nameCell);
    
    // Date completed
    const dateCell = document.createElement('td');
    dateCell.className = 'date-cell';
    
    if (quiz.date) {
      // Format the date if it exists
      const date = new Date(quiz.date);
      if (!isNaN(date.getTime())) {
        dateCell.textContent = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else {
        dateCell.textContent = quiz.date; // Use as is if it's not a valid date
      }
    } else {
      dateCell.textContent = '-';
    }
    row.appendChild(dateCell);
    
    // Score
    const scoreCell = document.createElement('td');
    scoreCell.className = 'score-cell';
    
    if (quiz.score !== null && quiz.score !== undefined) {
      scoreCell.textContent = `${quiz.score}%`;
      
      // Add a visual indicator of score quality
      if (quiz.score >= 90) {
        scoreCell.classList.add('excellent-score');
      } else if (quiz.score >= 80) {
        scoreCell.classList.add('good-score');
      } else if (quiz.score >= 70) {
        scoreCell.classList.add('average-score');
      } else if (quiz.score > 0) {
        scoreCell.classList.add('below-average-score');
      }
    } else {
      scoreCell.textContent = '-';
    }
    row.appendChild(scoreCell);
    
    // Time spent
    const timeCell = document.createElement('td');
    timeCell.className = 'time-cell';
    
    if (quiz.timeSpent !== null && quiz.timeSpent !== undefined) {
      // Format time nicely
      if (quiz.timeSpent < 60) {
        timeCell.textContent = `${quiz.timeSpent} min`;
      } else {
        const hours = Math.floor(quiz.timeSpent / 60);
        const minutes = quiz.timeSpent % 60;
        timeCell.textContent = `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
      }
    } else {
      timeCell.textContent = '-';
    }
    row.appendChild(timeCell);
    
    // Status
    const statusCell = document.createElement('td');
    statusCell.className = 'status-cell';
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge ${quiz.status}`;
    statusBadge.textContent = quiz.status === 'completed' ? 'Completed' : 'Pending';
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    // Add interaction for completed quizzes
    if (quiz.status === 'completed') {
      row.addEventListener('click', () => {
        showQuizDetails(quiz);
      });
      row.classList.add('clickable-row');
      
      // Add indicator for clickable rows
      const infoIcon = document.createElement('span');
      infoIcon.className = 'row-action-icon';
      infoIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      `;
      nameCell.appendChild(infoIcon);
    }
    
    // Add row to table
    tableBody.appendChild(row);
  });
  
  // Add a load more button if there are more quizzes available
  if (quizData.totalQuizzes > sortedQuizzes.length) {
    const loadMoreRow = document.createElement('tr');
    loadMoreRow.className = 'load-more-row';
    
    const loadMoreCell = document.createElement('td');
    loadMoreCell.colSpan = 5;
    loadMoreCell.className = 'load-more-cell';
    
    const loadMoreButton = document.createElement('button');
    loadMoreButton.className = 'load-more-button';
    loadMoreButton.textContent = 'Load More Quizzes';
    loadMoreButton.addEventListener('click', () => {
      loadMoreQuizzes();
    });
    
    loadMoreCell.appendChild(loadMoreButton);
    loadMoreRow.appendChild(loadMoreCell);
    tableBody.appendChild(loadMoreRow);
  }
  
  // Add a summary row at the top of the table
  if (sortedQuizzes.length > 0) {
    const tableHeader = table.querySelector('thead');
    
    // Remove existing summary if present
    const existingSummary = tableContainer.querySelector('.quiz-summary');
    if (existingSummary) {
      existingSummary.remove();
    }
    
    // Create summary container
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'quiz-summary';
    
    // Add summary content
    summaryContainer.innerHTML = `
      <div class="quiz-stat">
        <span class="quiz-stat-value">${quizData.completed}/${quizData.totalQuizzes}</span>
        <span class="quiz-stat-label">Quizzes Completed</span>
      </div>
      <div class="quiz-stat">
        <span class="quiz-stat-value">${quizData.averageScore || 0}%</span>
        <span class="quiz-stat-label">Average Score</span>
      </div>
      <div class="quiz-stat">
        <span class="quiz-stat-value">${quizData.highestScore || 0}%</span>
        <span class="quiz-stat-label">Highest Score</span>
      </div>
    `;
    
    // Insert summary before the table
    tableContainer.insertBefore(summaryContainer, table);
  }
}

// Function to load more quizzes
async function loadMoreQuizzes() {
  try {
    // Show loading state for the load more button
    const loadMoreButton = document.querySelector('.load-more-button');
    if (loadMoreButton) {
      loadMoreButton.textContent = 'Loading...';
      loadMoreButton.disabled = true;
    }
    
    // Fetch additional quiz data
    // You'd implement this endpoint in your backend
    const additionalQuizzes = await window.analyticsData.getAdditionalQuizzes();
    
    // Refresh the quiz data with the newly loaded quizzes
    const quizData = await window.analyticsData.getQuizPerformance(true);
    
    // Update the UI
    updateQuizTable(quizData);
    
  } catch (error) {
    console.error('Error loading more quizzes:', error);
    showToast('Failed to load additional quizzes', 'error');
    
    // Reset the button
    const loadMoreButton = document.querySelector('.load-more-button');
    if (loadMoreButton) {
      loadMoreButton.textContent = 'Load More Quizzes';
      loadMoreButton.disabled = false;
    }
  }
}

// Show detailed quiz information in a modal/popup
function showQuizDetails(quiz) {
  // Create a modal element if it doesn't exist
  let modal = document.getElementById('quiz-details-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quiz-details-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Add click event to close when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeQuizModal();
      }
    });
  }
  
  // Prepare quiz details content
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${quiz.name}</h3>
        <button class="modal-close-button" onclick="closeQuizModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="quiz-detail-grid">
          <div class="quiz-detail">
            <span class="detail-label">Date Completed</span>
            <span class="detail-value">${quiz.date || 'N/A'}</span>
          </div>
          <div class="quiz-detail">
            <span class="detail-label">Score</span>
            <span class="detail-value ${getScoreClass(quiz.score)}">${quiz.score ? `${quiz.score}%` : 'N/A'}</span>
          </div>
          <div class="quiz-detail">
            <span class="detail-label">Time Spent</span>
            <span class="detail-value">${quiz.timeSpent ? `${quiz.timeSpent} min` : 'N/A'}</span>
          </div>
          <div class="quiz-detail">
            <span class="detail-label">Status</span>
            <span class="detail-value">
              <span class="status-badge ${quiz.status}">${quiz.status === 'completed' ? 'Completed' : 'Pending'}</span>
            </span>
          </div>
        </div>
        
        ${quiz.topics ? `
          <div class="quiz-topics">
            <h4>Topics Covered</h4>
            <ul class="topic-list">
              ${quiz.topics.map(topic => `<li>${topic}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${quiz.feedback ? `
          <div class="quiz-feedback">
            <h4>Instructor Feedback</h4>
            <p>${quiz.feedback}</p>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        ${quiz.retakable ? '<button class="retake-quiz-button">Retake Quiz</button>' : ''}
        <button class="close-modal-button" onclick="closeQuizModal()">Close</button>
      </div>
    </div>
  `;
  
  // Register retake quiz button event if present
  const retakeButton = modal.querySelector('.retake-quiz-button');
  if (retakeButton) {
    retakeButton.addEventListener('click', () => {
      retakeQuiz(quiz.id || quiz.name);
    });
  }
  
  // Add the close quiz modal function to window
  window.closeQuizModal = function() {
    const modal = document.getElementById('quiz-details-modal');
    if (modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.classList.remove('closing');
        modal.style.display = 'none';
      }, 300);
    }
  };
  
  // Display the modal
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('open');
  }, 10);
}

// Function to determine score CSS class
function getScoreClass(score) {
  if (!score && score !== 0) return '';
  if (score >= 90) return 'excellent-score';
  if (score >= 80) return 'good-score';
  if (score >= 70) return 'average-score';
  return 'below-average-score';
}

// Function to handle quiz retake
function retakeQuiz(quizId) {
  // Close the modal
  window.closeQuizModal();
  
  // Show toast notification
  showToast('Preparing quiz for retake...', 'info');
  
  // Redirect to the quiz page
  // This would be implemented based on your app's routing
  setTimeout(() => {
    window.location.href = `/course/quiz/${quizId}?retake=true`;
  }, 1000);
}

// Set up event listeners for data updates
function setupDataUpdateListeners() {
  // Listen for data update events
  window.analyticsData.addEventListener('data-updated', async (data) => {
    // Update the UI with the new data
    updateKPICards(data);
    // Charts need to be destroyed and recreated to properly update
    destroyCharts();
    initializeCharts(data);
    updateQuizTable(data.quizPerformance);
  });
  
  // Listen for quiz completion events
  window.analyticsData.addEventListener('quiz-completed', async () => {
    // Refresh quiz performance data
    const quizData = await window.analyticsData.getQuizPerformance(true);
    // Update just the quiz-related elements
    updateQuizTable(quizData);
    // Need to destroy the chart first
    destroyChart('quizStatusChart');
    initializeQuizStatusChart(quizData);
  });
  
  // Listen for course progress update events
  window.analyticsData.addEventListener('course-progress-updated', async () => {
    // Refresh course progress data
    const courseData = await window.analyticsData.getCourseProgress(true);
    // Update the course progress KPI
    document.getElementById('course-progress-percentage').textContent = `${courseData.overallPercentage}%`;
    document.getElementById('course-progress-modules').textContent = 
      `${courseData.modulesCompleted} of ${courseData.totalModules} modules completed`;
  });
}

// Helper function to destroy all charts for redrawing
function destroyCharts() {
  const chartIds = ['streakLineChart', 'quizStatusChart', 'activityBarChart', 'skillCoverageChart'];
  chartIds.forEach(destroyChart);
}

// Helper function to destroy a specific chart
function destroyChart(chartId) {
  const chartInstance = Chart.getChart(chartId);
  if (chartInstance) {
    chartInstance.destroy();
  }
}

// Function to display error messages
function showErrorMessage(message) {
  const analyticsSection = document.querySelector('.analytics-section');
  
  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'analytics-error-message';
  errorDiv.textContent = message;
  
  // Add a retry button
  const retryButton = document.createElement('button');
  retryButton.className = 'retry-button';
  retryButton.textContent = 'Retry';
  retryButton.addEventListener('click', () => {
    errorDiv.remove();
    initializeAnalytics();
  });
  
  errorDiv.appendChild(retryButton);
  
  // Add to DOM
  analyticsSection.prepend(errorDiv);
}

// Load and display a motivational quote
async function loadMotivationalQuote() {
  try {
    const quoteContainer = document.querySelector('.motivational-quote-container');
    
    // Check if quotes are available in the global scope (from motivational-quotes.js)
    if (typeof window.motivationalQuotes !== 'undefined' && Array.isArray(window.motivationalQuotes) && window.motivationalQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * window.motivationalQuotes.length);
      const quote = window.motivationalQuotes[randomIndex];
      
      // Create quote HTML
      quoteContainer.innerHTML = `
        <div class="quote-content quote-fade-in">
          <div class="quote-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.17 6L4 11.17V16H8.83L14 10.83V6H9.17ZM10.83 10.17L8.83 12.17H6V9.17L8 7.17H10.83V10.17Z" fill="currentColor"/>
              <path d="M20 6L14.83 11.17V16H19.66L24.83 10.83V6H20ZM21.66 10.17L19.66 12.17H16.83V9.17L18.83 7.17H21.66V10.17Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="quote-text">${quote.text}</div>
          <div class="quote-author">- ${quote.author}</div>
        </div>
      `;
    } else {
      // If quotes aren't available, fetch from an API
      const response = await fetch('https://api.quotable.io/random?tags=education,learning,success');
      const data = await response.json();
      
      quoteContainer.innerHTML = `
        <div class="quote-content quote-fade-in">
          <div class="quote-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.17 6L4 11.17V16H8.83L14 10.83V6H9.17ZM10.83 10.17L8.83 12.17H6V9.17L8 7.17H10.83V10.17Z" fill="currentColor"/>
              <path d="M20 6L14.83 11.17V16H19.66L24.83 10.83V6H20ZM21.66 10.17L19.66 12.17H16.83V9.17L18.83 7.17H21.66V10.17Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="quote-text">${data.content}</div>
          <div class="quote-author">- ${data.author}</div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading motivational quote:', error);
    // Don't show error for quotes - just fail silently as it's non-critical
  }
}

// Convert hex color to RGB
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle shorthand hex (#fff)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// Function to manually refresh analytics data
window.refreshAnalytics = async function() {
  try {
    showLoadingState();
    
    // Refresh all data
    const data = await window.analyticsData.refreshAllData();
    
    // Apply any active filters
    const filteredData = analyticsState.filterPeriod !== 'all'
      ? filterDataByTimePeriod(data, analyticsState.filterPeriod)
      : data;
    
    // Update UI with the new data
    updateKPICards(filteredData);
    destroyCharts();
    initializeCharts(filteredData);
    updateQuizTable(filteredData.quizPerformance);
    
    hideLoadingState();
    
    // Show success message
    showToast('Analytics data refreshed successfully!', 'success');
  } catch (error) {
    console.error('Error refreshing analytics:', error);
    hideLoadingState();
    showToast('Failed to refresh analytics data.', 'error');
  }
};

// Toast notification function
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'toast-close';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    toast.remove();
  });
  toast.appendChild(closeButton);
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

// Add cleanup function to stop the interval when leaving the page
function cleanupAnalytics() {
  if (analyticsState.studyTimeInterval) {
    clearInterval(analyticsState.studyTimeInterval);
    analyticsState.studyTimeInterval = null;
  }
}

// Add event listener for page unload
window.addEventListener('unload', cleanupAnalytics);