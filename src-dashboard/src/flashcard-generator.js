document.addEventListener("DOMContentLoaded", function () {
  const OPENAI_API_KEY = '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';
  
  // Load required libraries
  const scriptPDF = document.createElement('script');
  scriptPDF.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  document.head.appendChild(scriptPDF);

  const scriptMammoth = document.createElement('script');
  scriptMammoth.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
  document.head.appendChild(scriptMammoth);
  
  // Set up file upload functionality
  const uploadButton = document.querySelector('.upload-for-flashcards-btn');
  const fileInput = document.getElementById('flashcard-document-input');
  
  if (uploadButton && fileInput) {
    uploadButton.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        // Show loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Reading document and generating flashcards...</p>
        `;
        document.body.appendChild(loadingDiv);

        // Read the file content
        const content = await readFileContent(file);
        
        // Generate flashcards from the content
        const flashcards = await generateFlashcardsFromText(content);
        
        // Store generated flashcards in IndexedDB
        await saveFlashcardsToIndexedDB(flashcards);
        
        // Update the display
        updateFlashcardsDisplay(flashcards);
        
        // Remove loading overlay
        document.body.removeChild(loadingDiv);
        
        // Clear the file input
        fileInput.value = '';
        
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file: ' + error.message);
        
        // Remove loading overlay if it exists
        const loadingDiv = document.querySelector('.loading-overlay');
        if (loadingDiv) {
          document.body.removeChild(loadingDiv);
        }
      }
    });
  }

  // Function to save flashcards to IndexedDB
  async function saveFlashcardsToIndexedDB(flashcards) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("auraLearningDB", 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["flashcards"], "readwrite");
        const store = transaction.objectStore("flashcards");
        
        // Clear existing flashcards
        store.clear();
        
        // Add new flashcards
        flashcards.forEach((card, index) => {
          store.add({
            id: `flashcard_${Date.now()}_${index}`,
            front: card.front,
            back: card.back,
            timestamp: Date.now()
          });
        });
        
        transaction.oncomplete = () => {
          console.log("Flashcards saved to IndexedDB");
          resolve();
        };
        
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  // Function to read file content based on file type
  async function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      if (file.type === 'application/pdf') {
        // Handle PDF files
        reader.onload = async function(e) {
          try {
            const typedarray = new Uint8Array(e.target.result);
            const loadingTask = pdfjsLib.getDocument(typedarray);
            const pdf = await loadingTask.promise;
            
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              textContent += content.items.map(item => item.str).join(' ') + '\n';
            }
            
            resolve(textContent);
          } catch (error) {
            reject(new Error('Error reading PDF: ' + error.message));
          }
        };
        reader.readAsArrayBuffer(file);
        
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword') {
        // Handle Word files
        reader.onload = async function(e) {
          try {
            const arrayBuffer = e.target.result;
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            resolve(result.value);
          } catch (error) {
            reject(new Error('Error reading Word document: ' + error.message));
          }
        };
        reader.readAsArrayBuffer(file);
        
      } else {
        // Handle text files
        reader.onload = function(e) {
          resolve(e.target.result);
        };
        reader.readAsText(file);
      }
      
      reader.onerror = function(e) {
        reject(new Error('Error reading file: ' + e.target.error));
      };
    });
  }

  async function generateFlashcardsFromText(textContent) {
    // Trim content if too long
    if (textContent.length > 8000) {
      textContent = textContent.substring(0, 8000) + "... (content truncated due to length)";
    }

    const systemPrompt = `Create 15 flashcards from the provided notes. Each flashcard should have a concise term/concept on the front and a detailed explanation on the back. Format the response as a JSON array of objects with 'front' and 'back' properties. Example format: [{"front":"What is photosynthesis?","back":"The process by which plants convert light energy into chemical energy"}]. Return ONLY the JSON array without any additional text or formatting.`;

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
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
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      let flashcardsContent = data.choices[0].message.content;
      
      // Clean up the response
      flashcardsContent = flashcardsContent.trim();
      if (flashcardsContent.startsWith("```") && flashcardsContent.endsWith("```")) {
        flashcardsContent = flashcardsContent.replace(/^```(?:json)?\s*|\s*```$/g, "");
      }
      
      const parsedFlashcards = JSON.parse(flashcardsContent);
      
      if (!Array.isArray(parsedFlashcards) || parsedFlashcards.length === 0) {
        throw new Error("Invalid flashcards data received");
      }

      // Validate the structure of each flashcard
      if (!parsedFlashcards.every(card => card.front && card.back)) {
        throw new Error("Invalid flashcard format received");
      }

      return parsedFlashcards;
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  }

  function updateFlashcardsDisplay(flashcards) {
    // Dispatch event to update flashcards
    const event = new CustomEvent('flashcardsGenerated', { detail: flashcards });
    document.dispatchEvent(event);
  }
}); 