document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("file-input");
    const fileName = document.getElementById("file-name");
    const uploadForm = document.getElementById("upload-form");
    const loadingIndicator = document.getElementById("loading");
    const submitButton = document.querySelector(".submit-button");
    // TODO: add your own API key
    const OPENAI_API_KEY = "open_ai_api_key";
  
    // Initially disable the submit button until we have valid content
    submitButton.disabled = true;
  
    // Create preview container for extracted text
    const previewContainer = document.createElement('div');
    previewContainer.className = 'text-preview-container';
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = `
      <h3>Text Preview</h3>
      <div class="text-preview-content"></div>
    `;
    uploadForm.insertBefore(previewContainer, uploadForm.querySelector('.upload-settings'));
  
    // Add some CSS for the preview
    const style = document.createElement('style');
    style.textContent = `
      .text-preview-container {
        margin: 15px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      .text-preview-container h3 {
        margin-top: 0;
        font-size: 16px;
        color: #333;
      }
      .text-preview-content {
        max-height: 150px;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.4;
        white-space: pre-wrap;
        background-color: white;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #eee;
      }
      .submit-button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
      }
      .error-message {
        color: #ff3333;
        margin-top: 5px;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  
    // Load PDF.js library dynamically
    const pdfJsScript = document.createElement('script');
    pdfJsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(pdfJsScript);
  
    // Variable to store extracted content for later use
    let extractedContent = null;
  
    // Display file name when a file is selected
    fileInput.addEventListener("change", async function () {
      // Reset state
      extractedContent = null;
      submitButton.disabled = true;
      previewContainer.style.display = 'none';
      
      // Remove any previous error messages
      const oldError = document.querySelector('.error-message');
      if (oldError) oldError.remove();
  
      if (this.files && this.files[0]) {
        const file = this.files[0];
        fileName.textContent = file.name;
        
        // Extract and show text snippet based on file type
        if (file.type === "application/pdf") {
          fileName.textContent = file.name + " (Extracting text...)";
          
          try {
            const textContent = await extractTextFromPdf(file);
            if (!textContent || textContent.trim().length < 50) {
              fileName.textContent = file.name;
              
              // Show error message
              const errorMsg = document.createElement('div');
              errorMsg.className = 'error-message';
              errorMsg.textContent = 'This PDF appears to be image-based or has no extractable text. Please try a different file.';
              fileName.parentNode.appendChild(errorMsg);
              
              submitButton.disabled = true;
            } else {
              fileName.textContent = file.name + " (PDF text extracted)";
              extractedContent = textContent;
              submitButton.disabled = false;
              
              // Show text preview
              showTextPreview(textContent);
            }
          } catch (error) {
            console.error("PDF validation error:", error);
            fileName.textContent = file.name;
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Cannot extract text from this PDF. It may be protected or corrupted.';
            fileName.parentNode.appendChild(errorMsg);
            
            submitButton.disabled = true;
          }
        } else if (file.type === "text/plain") {
          // For text files, read and display content
          const reader = new FileReader();
          reader.onload = function(e) {
            const textContent = e.target.result;
            
            if (!textContent || textContent.trim().length < 10) {
              fileName.textContent = file.name;
              
              // Show error message
              const errorMsg = document.createElement('div');
              errorMsg.className = 'error-message';
              errorMsg.textContent = 'This text file appears to be empty or has insufficient content.';
              fileName.parentNode.appendChild(errorMsg);
              
              submitButton.disabled = true;
            } else {
              extractedContent = textContent;
              showTextPreview(textContent);
              submitButton.disabled = false;
            }
          };
          reader.onerror = function() {
            fileName.textContent = file.name;
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Unable to read this text file. It may be corrupted.';
            fileName.parentNode.appendChild(errorMsg);
            
            submitButton.disabled = true;
          };
          reader.readAsText(file);
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          // For DOCX files, we can't easily extract text in the browser
          fileName.textContent = file.name;
          
          // Show error message
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'DOCX files cannot be processed directly in the browser. Please convert to TXT or PDF.';
          fileName.parentNode.appendChild(errorMsg);
          
          submitButton.disabled = true;
        } else {
          fileName.textContent = file.name;
          
          // Show error message
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.textContent = 'Unsupported file format. Please upload a PDF or TXT file.';
          fileName.parentNode.appendChild(errorMsg);
          
          submitButton.disabled = true;
        }
      } else {
        fileName.textContent = "No file chosen";
        submitButton.disabled = true;
      }
    });
  
    // Display text preview
    function showTextPreview(text) {
      const previewContent = previewContainer.querySelector('.text-preview-content');
      // Limit to first 500 characters for the preview
      const previewText = text.length > 500 ? text.substring(0, 500) + '...' : text;
      previewContent.textContent = previewText;
      previewContainer.style.display = 'block';
    }
  
    // Extract text from PDF using PDF.js
    async function extractTextFromPdf(file) {
      return new Promise((resolve, reject) => {
        // Ensure PDF.js is loaded
        if (typeof pdfjsLib === 'undefined') {
          pdfJsScript.onload = () => {
            // Set worker source after loading
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            extractPdfText();
          };
        } else {
          extractPdfText();
        }
  
        function extractPdfText() {
          const fileReader = new FileReader();
          
          fileReader.onload = async function() {
            try {
              const typedArray = new Uint8Array(this.result);
              const loadingTask = pdfjsLib.getDocument({ data: typedArray });
              
              const pdf = await loadingTask.promise;
              let textContent = '';
  
              // Extract text from each page
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const pageText = await page.getTextContent();
                const pageContent = pageText.items.map(item => item.str).join(' ');
                textContent += `--- Page ${i} ---\n${pageContent}\n\n`;
                
                // If we get enough text for validation, we can resolve early
                if (i === 3 && textContent.length > 1000) {
                  resolve(textContent);
                  return;
                }
              }
  
              resolve(textContent);
            } catch (error) {
              reject(error);
            }
          };
          
          fileReader.onerror = reject;
          fileReader.readAsArrayBuffer(file);
        }
      });
    }
  
    // Handle form submission
    uploadForm.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      if (!fileInput.files || !fileInput.files[0]) {
        alert("Please select a file first.");
        return;
      }
  
      if (!extractedContent) {
        alert("No valid content was extracted from the file. Please try a different file.");
        return;
      }
  
      const numQuestions = document.getElementById("num-questions").value;
  
      // Show loading indicator
      loadingIndicator.style.display = "block";
      uploadForm.style.display = "none";
  
      try {
        const quizData = await generateQuizFromText(extractedContent, numQuestions);
  
        // Store quiz data in localStorage to access from quiz page
        localStorage.setItem("quizData", JSON.stringify(quizData));
  
        // Redirect to the quiz page
        window.location.href = "quiz.html";
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while generating the quiz: " + error.message);
  
        // Hide loading indicator and show form again
        loadingIndicator.style.display = "none";
        uploadForm.style.display = "block";
      }
    });
  
    // Generate quiz questions from text content using OpenAI
    async function generateQuizFromText(textContent, numQuestions) {
      // Significantly reduce the content length - OpenAI has strict token limits
      // GPT models typically have a 4K-8K token limit, which is roughly 3K-6K words
      if (textContent.length > 8000) {
        console.log("Content too long, truncating from", textContent.length, "to 8000 characters");
        textContent = textContent.substring(0, 8000) + "... (content truncated due to length)";
      }
  
      // System prompt with instructions - keep it short and precise
      const systemPrompt = `Create ${numQuestions} multiple-choice quiz questions about the provided notes. Each question should have 4 options with one correct answer. IMPORTANT: Return ONLY the raw JSON array with this structure: [{"question":"text","options":["A","B","C","D"],"correctAnswer":"correct option"}]. Do not include any markdown formatting, code blocks, or explanations.`;
  
      try {
        console.log("Making API request to OpenAI with content length:", textContent.length);
        
        // Make the OpenAI API request with the extracted text in the message
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo", // Try a different model that's more reliable
              messages: [
                {
                  role: "system",
                  content: systemPrompt
                },
                {
                  role: "user",
                  content: "Notes:\n\n" + textContent
                }
              ],
              temperature: 0.7
            })
          }
        );
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error Response:", errorData);
          throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("API Response received:", data);
  
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error("Unexpected API response format:", data);
          throw new Error("Received an invalid response format from OpenAI");
        }
  
        // Parse the response content as JSON
        const quizContent = data.choices[0].message.content;
        console.log("Quiz content received:", quizContent);
        
        // Clean up the response before parsing
        let cleanedContent = quizContent.trim();
        
        // Handle the case where the response is wrapped in markdown code blocks
        if (cleanedContent.startsWith("```") && cleanedContent.endsWith("```")) {
          // Extract content between the code block markers
          cleanedContent = cleanedContent.replace(/^```(?:json)?\s*|\s*```$/g, "");
        }
        
        // Handle any other JSON formatting issues
        cleanedContent = cleanedContent.replace(/^\s*\[\s*\n/, "[").replace(/\s*\]\s*$/, "]");
        
        console.log("Cleaned content for parsing:", cleanedContent);
        const parsedQuiz = JSON.parse(cleanedContent);
        
        // Validate the quiz structure
        if (!Array.isArray(parsedQuiz) || parsedQuiz.length === 0) {
          throw new Error("Quiz data is not a valid array");
        }
        
        // Check if at least one question has the correct structure
        const firstQuestion = parsedQuiz[0];
        if (!firstQuestion.question || !Array.isArray(firstQuestion.options) || !firstQuestion.correctAnswer) {
          throw new Error("Quiz questions have incorrect format");
        }
        
        return parsedQuiz;
      } catch (error) {
        console.error("API call error:", error);
        
        // If the error is due to the API key, make that clear
        if (error.message && error.message.includes("API key")) {
          throw new Error("Invalid or expired API key. Please update the API key and try again.");
        }
        
        // If we explicitly want to use mock data instead of showing an error to the user
        // return generateMockQuizData(numQuestions);
        
        // Or rethrow the error to show it to the user
        throw error;
      }
    }
  
    // Generate mock quiz data for demonstration or fallback
    function generateMockQuizData(numQuestions) {
      console.log("Generating mock quiz data as fallback");
      const mockQuiz = [];
      for (let i = 0; i < numQuestions; i++) {
        mockQuiz.push({
          question: `Sample Question ${i + 1}: What is the capital of France?`,
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: "Paris",
        });
      }
      return mockQuiz;
    }
  });