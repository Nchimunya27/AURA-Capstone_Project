// Quiz Manager - Handles dynamic quiz content
class QuizManager {
    constructor() {
        this.upcomingList = document.getElementById('upcoming-quizzes-list');
        this.pastList = document.getElementById('past-quizzes-list');
        this.upcomingTemplate = document.getElementById('upcoming-quiz-template');
        this.pastTemplate = document.getElementById('past-quiz-template');
        this.upcomingEmptyState = document.getElementById('upcoming-empty-state');
        this.pastEmptyState = document.getElementById('past-empty-state');
        this.initializeQuizHistory();
    }

    // Initialize quiz history from localStorage
    initializeQuizHistory() {
        this.quizHistory = JSON.parse(localStorage.getItem('quizHistory')) || [];
        this.updatePastQuizzes(this.quizHistory);
    }

    // Record a new quiz attempt
    recordQuizAttempt() {
        const attemptCount = this.quizHistory.length + 1;
        const newQuiz = {
            title: `Quiz ${attemptCount}`,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100 for demo
            id: Date.now() // Unique identifier for the quiz
        };

        this.quizHistory.unshift(newQuiz); // Add to beginning of array
        localStorage.setItem('quizHistory', JSON.stringify(this.quizHistory));
        this.updatePastQuizzes(this.quizHistory);
    }

    // Update quiz displays
    updateQuizzes(upcomingQuizzes = [], pastQuizzes = []) {
        this.updateUpcomingQuizzes(upcomingQuizzes);
        this.updatePastQuizzes(this.quizHistory); // Use stored history instead
    }

    // Update upcoming quizzes section
    updateUpcomingQuizzes(quizzes) {
        // Clear existing quizzes except the empty state
        const items = this.upcomingList.querySelectorAll('.upcoming-item');
        items.forEach(item => item.remove());

        // Show/hide empty state based on quizzes array
        this.upcomingEmptyState.style.display = quizzes.length === 0 ? 'block' : 'none';

        // If there are quizzes, add them to the list
        if (quizzes.length > 0) {
            quizzes.forEach(quiz => {
                const quizElement = this.createQuizElement(quiz, true);
                this.upcomingList.appendChild(quizElement);
            });
        }
    }

    // Update past quizzes section
    updatePastQuizzes(quizzes) {
        // Clear existing quizzes except the empty state
        const items = this.pastList.querySelectorAll('.upcoming-item');
        items.forEach(item => item.remove());

        // Show/hide empty state based on quizzes array
        this.pastEmptyState.style.display = quizzes.length === 0 ? 'block' : 'none';

        // If there are quizzes, add them to the list
        if (quizzes.length > 0) {
            quizzes.forEach(quiz => {
                const quizElement = this.createQuizElement(quiz, false);
                this.pastList.appendChild(quizElement);
            });
        }
    }

    // Create a quiz element from template
    createQuizElement(quiz, isUpcoming) {
        const template = isUpcoming ? this.upcomingTemplate : this.pastTemplate;
        const clone = template.content.cloneNode(true);
        
        const quizItem = clone.querySelector('.upcoming-item');
        const title = clone.querySelector('.quiz-title');
        const date = clone.querySelector('.quiz-date');
        const status = clone.querySelector('.quiz-status');
        const icon = clone.querySelector('.quiz-icon i');

        title.textContent = quiz.title;
        date.textContent = quiz.date;
        
        if (isUpcoming) {
            status.textContent = quiz.status;
            status.classList.add(quiz.status.toLowerCase());
            icon.className = quiz.locked ? 'fas fa-lock' : 'fas fa-calendar';
        } else {
            status.textContent = `${quiz.score}%`;
            status.classList.add(this.getScoreClass(quiz.score));
            icon.className = 'fas fa-check';

            // Add click handler for past quizzes
            quizItem.style.cursor = 'pointer';
            quizItem.dataset.quizId = quiz.id;
            quizItem.addEventListener('click', () => this.navigateToQuizResult(quiz));
        }

        return clone;
    }

    // Navigate to quiz result
    navigateToQuizResult(quiz) {
        // Store the current quiz data for the results page
        localStorage.setItem('currentQuizResult', JSON.stringify(quiz));
        // Navigate to the quiz results page
        window.location.href = 'quiz-result.html';
    }

    // Get appropriate class based on score
    getScoreClass(score) {
        if (score >= 90) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'average';
        return 'needs-improvement';
    }

    // Format date for display
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }
}

// Initialize quiz manager
const quizManager = new QuizManager();

// Add event listener for quiz page visits
if (window.location.pathname.endsWith('quiz.html')) {
    quizManager.recordQuizAttempt();
}

// Example usage:
// quizManager.updateQuizzes(upcomingQuizzes, pastQuizzes); 