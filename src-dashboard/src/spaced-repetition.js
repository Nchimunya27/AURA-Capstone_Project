/**
 * Spaced Repetition Algorithm for Exam Preparation
 */

function generateReviewSchedule(examDate, competencePercentage, startDate = new Date()) {
  if (!(examDate instanceof Date)) {
    examDate = new Date(examDate);
  }
  
  if (startDate >= examDate) {
    throw new Error("Start date must be before exam date");
  }
  
  if (competencePercentage < 0 || competencePercentage > 100) {
    throw new Error("Competence percentage must be between 0 and 100");
  }

  const daysUntilExam = calculateDaysBetween(startDate, examDate);
  const optimalRepetitions = calculateOptimalRepetitions(daysUntilExam, competencePercentage);
  const reviewDates = calculateReviewDates(startDate, examDate, optimalRepetitions);
  const message = formatReviewMessage(reviewDates);
  
  return {
    reviewDates,
    message,
    totalRepetitions: optimalRepetitions
  };
}

function calculateDaysBetween(startDate, endDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const differenceMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(differenceMs / millisecondsPerDay);
}

function calculateOptimalRepetitions(daysUntilExam, competencePercentage) {
  let baseRepetitions;
  
  if (daysUntilExam <= 1) {
    return 1;
  } else if (daysUntilExam <= 3) {
    baseRepetitions = 2;
  } else if (daysUntilExam <= 7) {
    baseRepetitions = 3;
  } else if (daysUntilExam <= 14) {
    baseRepetitions = 4;
  } else if (daysUntilExam <= 30) {
    baseRepetitions = 5;
  } else {
    baseRepetitions = 6;
  }
  
  const competenceAdjustment = Math.round((100 - competencePercentage) / 25);
  const adjustedRepetitions = baseRepetitions + competenceAdjustment;
  
  return Math.min(adjustedRepetitions, daysUntilExam);
}

function calculateReviewDates(startDate, examDate, repetitions) {
  const reviewDates = [];
  const daysUntilExam = calculateDaysBetween(startDate, examDate);
  
  reviewDates.push(new Date(startDate));
  
  if (repetitions <= 1) {
    return reviewDates;
  }
  
  const intervalMultiplier = 2.5;
  let lastInterval = 1;
  let daysUsed = 0;
  
  for (let i = 1; i < repetitions; i++) {
    if (i === repetitions - 1) {
      const finalReviewDate = new Date(examDate);
      finalReviewDate.setDate(examDate.getDate() - 1);
      
      if (reviewDates.length > 0) {
        const lastReviewDate = reviewDates[reviewDates.length - 1];
        if (calculateDaysBetween(lastReviewDate, finalReviewDate) < 1) {
          continue;
        }
      }
      
      reviewDates.push(finalReviewDate);
      continue;
    }
    
    if (i === 1) {
      lastInterval = 1;
    } else {
      lastInterval = Math.round(lastInterval * intervalMultiplier);
    }
    
    daysUsed += lastInterval;
    
    if (daysUsed >= daysUntilExam - 2) {
      const remainingDays = daysUntilExam - daysUsed;
      const remainingReviews = repetitions - i;
      
      if (remainingReviews > 0) {
        return redistributeRemainingReviews(reviewDates, startDate, examDate, remainingReviews);
      }
      break;
    }
    
    const nextReviewDate = new Date(startDate);
    nextReviewDate.setDate(startDate.getDate() + daysUsed);
    reviewDates.push(nextReviewDate);
  }
  
  return reviewDates;
}

function redistributeRemainingReviews(existingDates, startDate, examDate, remainingReviews) {
  const lastScheduledDate = existingDates[existingDates.length - 1];
  const daysRemaining = calculateDaysBetween(lastScheduledDate, examDate);
  const possibleDays = Math.max(1, daysRemaining - 1);
  
  if (remainingReviews > possibleDays) {
    remainingReviews = possibleDays;
  }
  
  if (remainingReviews <= 0) {
    return existingDates;
  }
  
  const interval = Math.floor(possibleDays / (remainingReviews + 1));
  let daysFromLast = interval;
  
  for (let i = 0; i < remainingReviews; i++) {
    if (i === remainingReviews - 1) {
      const finalReviewDate = new Date(examDate);
      finalReviewDate.setDate(examDate.getDate() - 1);
      existingDates.push(finalReviewDate);
    } else {
      const nextDate = new Date(lastScheduledDate);
      nextDate.setDate(lastScheduledDate.getDate() + daysFromLast);
      existingDates.push(nextDate);
      daysFromLast += interval;
    }
  }
  
  return existingDates;
}

function formatReviewMessage(reviewDates) {
  if (reviewDates.length === 0) {
    return "No review dates scheduled.";
  }
  
  if (reviewDates.length === 1) {
    return `Review on ${formatDate(reviewDates[0])}`;
  }
  
  const formattedDates = reviewDates.map(date => formatDate(date));
  return "Review on: " + formattedDates.join(", ");
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
}

window.SpacedRepetition = {
  generateReviewSchedule,
  calculateDaysBetween,
  calculateOptimalRepetitions,
  calculateReviewDates,
  formatReviewMessage
}; 