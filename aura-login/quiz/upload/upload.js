document.addEventListener("DOMContentLoaded", async function () {
  // Set worker for PDF.js
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  // Initialize UI
  initSidebar("upload");

  // Check authentication
  const user = await checkAuth();
  if (!user) return;

  // Display username
  document.getElementById("current-user").textContent =
    user.user_metadata.username || user.email;

  // Get DOM elements
  const dropzone = document.getElementById("upload-dropzone");
  const fileInput = document.getElementById("file-input");
  const filePreview = document.getElementById("file-preview");
  const textPreview = document.getElementById("text-preview");
  const fileNameElement = document.getElementById("file-name");
  const removeFileButton = document.getElementById("remove-file");
  const generateButton = document.getElementById("generate-button");
  const uploadForm = document.getElementById("upload-form");
  const quizTitleInput = document.getElementById("quiz-title");

  // Variable to store extracted content
  let extractedContent = null;
  let uploadedFile = null;

  // Handle file selection via input
  fileInput.addEventListener("change", function (e) {
    if (this.files && this.files[0]) {
      handleFile(this.files[0]);
    }
  });

  // Handle drag and drop
  dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    this.classList.add("active");
  });

  dropzone.addEventListener("dragleave", function () {
    this.classList.remove("active");
  });

  dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    this.classList.remove("active");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // Handle remove file button
  removeFileButton.addEventListener("click", function () {
    resetFileUpload();
  });

  // Handle form submission
  uploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!extractedContent) {
      showToast("Please upload a file first", true);
      return;
    }

    const numQuestions = document.getElementById("num-questions").value;
    const quizTitle = quizTitleInput.value || uploadedFile.name;

    try {
      showLoading("Generating quiz questions...");

      // Call OpenAI to generate quiz questions
      const quizData = await generateQuizFromText(
        extractedContent,
        numQuestions
      );

      // Save to Supabase
      const quiz = await quizDb.quizzes.create(
        user.id,
        quizTitle,
        extractedContent
      );
      const questions = await quizDb.questions.create(quiz.id, quizData);
      const attempt = await quizDb.attempts.create(quiz.id, user.id);

      // Store IDs for quiz page
      localStorage.setItem("currentQuizId", quiz.id);
      localStorage.setItem("currentAttemptId", attempt.id);

      hideLoading();
      showToast("Quiz generated successfully!");

      // Redirect to the quiz page
      setTimeout(() => {
        navigateTo("take");
      }, 1000);
    } catch (error) {
      hideLoading();
      console.error("Error generating quiz:", error);
      showToast("Error generating quiz: " + error.message, true);
    }
  });

  // Process uploaded file
  async function handleFile(file) {
    // Reset state
    extractedContent = null;
    uploadedFile = file;
    generateButton.disabled = true;

    // Update UI to show file name
    fileNameElement.textContent = file.name;

    try {
      showLoading("Processing file...");

      // Extract text based on file type
      if (file.type === "application/pdf") {
        extractedContent = await extractTextFromPdf(file);
      } else if (file.type === "text/plain") {
        extractedContent = await extractTextFromTxt(file);
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        showToast(
          "DOCX files are not supported in the browser. Please convert to PDF or TXT.",
          true
        );
        hideLoading();
        return;
      } else {
        showToast(
          "Unsupported file format. Please upload a PDF or TXT file.",
          true
        );
        hideLoading();
        return;
      }

      // Check if we got enough content
      if (!extractedContent || extractedContent.trim().length < 100) {
        showToast(
          "Could not extract sufficient text from the file. Please try another file.",
          true
        );
        hideLoading();
        return;
      }

      // Show preview of extracted text
      textPreview.textContent =
        extractedContent.length > 500
          ? extractedContent.substring(0, 500) + "..."
          : extractedContent;

      // Show file preview and hide dropzone
      dropzone.style.display = "none";
      filePreview.style.display = "block";

      // Auto-populate quiz title if empty
      if (!quizTitleInput.value) {
        quizTitleInput.value = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      }

      // Enable generate button
      generateButton.disabled = false;

      hideLoading();
    } catch (error) {
      hideLoading();
      console.error("Error processing file:", error);
      showToast("Error processing file: " + error.message, true);
    }
  }

  // Reset file upload state
  function resetFileUpload() {
    fileInput.value = "";
    extractedContent = null;
    uploadedFile = null;
    filePreview.style.display = "none";
    dropzone.style.display = "block";
    generateButton.disabled = true;
  }

  // Extract text from PDF
  async function extractTextFromPdf(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);
          const loadingTask = pdfjsLib.getDocument({ data: typedArray });

          const pdf = await loadingTask.promise;
          let textContent = "";

          // Get text from each page
          for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
            // Limit to 20 pages max for performance
            const page = await pdf.getPage(i);
            const pageText = await page.getTextContent();
            const pageContent = pageText.items
              .map((item) => item.str)
              .join(" ");
            textContent += `--- Page ${i} ---\n${pageContent}\n\n`;
          }

          resolve(textContent);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  }

  // Extract text from TXT
  async function extractTextFromTxt(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = function () {
        resolve(this.result);
      };

      fileReader.onerror = reject;
      fileReader.readAsText(file);
    });
  }

  // Generate quiz from text using OpenAI
  async function generateQuizFromText(text, numQuestions) {
    // Cut text if it's too long (OpenAI has token limits)
    if (text.length > 8000) {
      text = text.substring(0, 8000) + "... (content truncated due to length)";
    }

    // OpenAI API key from your existing code
    const OPENAI_API_KEY =
      "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";

    // System prompt with instructions
    const systemPrompt = `Create ${numQuestions} multiple-choice quiz questions about the provided notes. Each question should have 4 options with one correct answer. IMPORTANT: Return ONLY the raw JSON array with this structure: [{"question":"text","options":["A","B","C","D"],"correctAnswer":"correct option"}]. Do not include any markdown formatting, code blocks, or explanations.`;

    // Make the API request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: "Notes:\n\n" + text,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        errorData.error?.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Parse the response content as JSON
    const quizContent = data.choices[0].message.content;

    // Clean up the response before parsing
    let cleanedContent = quizContent.trim();

    // Handle the case where the response is wrapped in markdown code blocks
    if (cleanedContent.startsWith("```") && cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.replace(/^```(?:json)?\s*|\s*```$/g, "");
    }

    // Handle any other JSON formatting issues
    cleanedContent = cleanedContent
      .replace(/^\s*\[\s*\n/, "[")
      .replace(/\s*\]\s*$/, "]");

    // Parse and validate
    const parsedQuiz = JSON.parse(cleanedContent);
    if (!Array.isArray(parsedQuiz) || parsedQuiz.length === 0) {
      throw new Error("Quiz data is not a valid array");
    }

    // Check if at least one question has the correct structure
    const firstQuestion = parsedQuiz[0];
    if (
      !firstQuestion.question ||
      !Array.isArray(firstQuestion.options) ||
      !firstQuestion.correctAnswer
    ) {
      throw new Error("Quiz questions have incorrect format");
    }

    return parsedQuiz;
  }
});
