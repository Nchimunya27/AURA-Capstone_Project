document.addEventListener("DOMContentLoaded", function () {
  // Variables to track flashcard state
  let currentCardIndex = 7;
  let totalCards = 85;
  let isShowingAnswer = false;

  // DOM elements
  const showAnswerBtn = document.querySelector(".show-answer-btn");
  const cardQuestion = document.querySelector(".card-question");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const cardCounter = document.querySelector(".card-counter");
  const resetBtn = document.querySelector(".reset-btn");
  const refreshBtn = document.querySelector(".refresh-btn");

  // Sample flashcards data
  const flashcards = [
    {
      question: "What does HTML Stand for?",
      answer: "HyperText Markup Language",
    },
    {
      question: "What does CSS Stand for?",
      answer: "Cascading Style Sheets",
    },
    {
      question: "What is JavaScript primarily used for?",
      answer: "Adding interactivity to web pages",
    },
    // Add more flashcards as needed
  ];

  // Show answer button functionality
  showAnswerBtn.addEventListener("click", function () {
    if (!isShowingAnswer) {
      // Show the answer
      cardQuestion.textContent = flashcards[0].answer;
      showAnswerBtn.textContent = "Show Question";
      isShowingAnswer = true;
    } else {
      // Show the question
      cardQuestion.textContent = flashcards[0].question;
      showAnswerBtn.textContent = "Show Answer";
      isShowingAnswer = false;
    }
  });

  // Navigation buttons functionality
  prevBtn.addEventListener("click", function () {
    if (currentCardIndex > 1) {
      currentCardIndex--;
      updateCardCounter();
      // In a real app, you would load the previous card content here
    }
  });

  nextBtn.addEventListener("click", function () {
    if (currentCardIndex < totalCards) {
      currentCardIndex++;
      updateCardCounter();
      // In a real app, you would load the next card content here
    }
  });

  // Reset button functionality
  resetBtn.addEventListener("click", function () {
    // Reset the current card
    if (isShowingAnswer) {
      cardQuestion.textContent = flashcards[0].question;
      showAnswerBtn.textContent = "Show Answer";
      isShowingAnswer = false;
    }
  });

  // Refresh button functionality
  refreshBtn.addEventListener("click", function () {
    // Refresh the current card or get a new random card
    // In a real app, you might implement spaced repetition logic here
  });

  // Update card counter display
  function updateCardCounter() {
    cardCounter.textContent = `${currentCardIndex} / ${totalCards}`;
  }

  // Time Set button functionality
  const timeSetBtn = document.querySelector(".time-set-btn");
  timeSetBtn.addEventListener("click", function () {
    alert(
      "Time Set feature would allow you to set a timer for your study session."
    );
  });

  // Filter button functionality
  const filterBtn = document.querySelector(".filter-btn");
  filterBtn.addEventListener("click", function () {
    alert(
      "Filter feature would allow you to filter cards by difficulty, tags, or other criteria."
    );
  });

  // Control buttons functionality
  const playBtn = document.querySelector(".play-btn");
  playBtn.addEventListener("click", function () {
    alert("Play feature would start an automatic slideshow of cards.");
  });

  const shuffleBtn = document.querySelector(".shuffle-btn");
  shuffleBtn.addEventListener("click", function () {
    alert("Shuffle feature would randomize the order of cards.");
  });

  const settingsBtn = document.querySelector(".settings-btn");
  settingsBtn.addEventListener("click", function () {
    alert(
      "Settings feature would allow you to customize your flashcard experience."
    );
  });

  const fullscreenBtn = document.querySelector(".fullscreen-btn");
  fullscreenBtn.addEventListener("click", function () {
    // Toggle fullscreen mode
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });
});
