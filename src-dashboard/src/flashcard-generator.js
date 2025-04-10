document.addEventListener("DOMContentLoaded", function () {
  const OPENAI_API_KEY = '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';
  
  // Load required libraries
  const scriptPDF = document.createElement('script');
  scriptPDF.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  document.head.appendChild(scriptPDF);

  const scriptMammoth = document.createElement('script');
  scriptMammoth.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
  document.head.appendChild(scriptMammoth);
  
  // Initialize UI elements
  const uploadButton = document.querySelector('.upload-for-flashcards-btn');
  const fileInput = document.getElementById('flashcard-document-input');
  const createSetBtn = document.querySelector('.create-set-btn');
  const setNameInput = document.querySelector('.set-name-input');
  const flashcardSetsGrid = document.querySelector('.flashcard-sets-grid');
  const flashcardStudyView = document.querySelector('.flashcard-study-view');
  const backToSetsBtn = document.querySelector('.back-to-sets-btn');
  const setTitle = document.querySelector('.set-title');
  
  let currentSetId = null;

  // Function to create a new flashcard set
  async function createFlashcardSet(name) {
    if (!name.trim()) return;

    const setId = `set_${Date.now()}`;
    const newSet = {
      id: setId,
      name: name.trim(),
      cards: [],
      created: Date.now(),
      lastStudied: null,
      cardCount: 0
    };

    try {
      await saveFlashcardSet(newSet);
      renderFlashcardSet(newSet);
      setNameInput.value = '';
      return setId;
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      alert('Failed to create flashcard set. Please try again.');
    }
  }

  // Function to save flashcard set to IndexedDB
  async function saveFlashcardSet(set) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("auraLearningDB", 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["flashcards"], "readwrite");
        const store = transaction.objectStore("flashcards");
        
        const request = store.put(set);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      };
    });
  }

  // Function to load flashcard sets from IndexedDB
  async function loadFlashcardSets() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("auraLearningDB", 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["flashcards"], "readonly");
        const store = transaction.objectStore("flashcards");
        const request = store.getAll();
        
        request.onsuccess = () => {
          const sets = request.result.filter(item => item.id.startsWith('set_'));
          resolve(sets);
        };
        
        request.onerror = () => reject(request.error);
      };
    });
  }

  // Function to render a flashcard set card
  function renderFlashcardSet(set) {
    const setCard = document.createElement('div');
    setCard.className = 'flashcard-set-card';
    setCard.dataset.setId = set.id;
    
    const lastStudied = set.lastStudied ? new Date(set.lastStudied).toLocaleDateString() : 'Never';
    
    setCard.innerHTML = `
      <div class="set-card-header">
        <h3 class="set-card-title">${set.name}</h3>
        <div class="set-card-actions">
          <span class="set-card-count">${set.cardCount} cards</span>
          <button class="delete-set-btn" title="Delete set">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <div class="set-card-footer">
        <div class="set-last-studied">
          <i class="far fa-clock"></i>
          Last studied: ${lastStudied}
        </div>
        <button class="study-btn">
          <i class="fas fa-play"></i>
          Study
        </button>
      </div>
    `;
    
    // Add study button click handler
    setCard.querySelector('.study-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openStudyView(set);
    });

    // Add delete button click handler
    setCard.querySelector('.delete-set-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete "${set.name}"? This action cannot be undone.`)) {
        try {
          await deleteFlashcardSet(set.id);
          setCard.style.opacity = '0';
          setCard.style.transform = 'translateY(20px)';
          setTimeout(() => {
            setCard.remove();
            // If this was the current set being studied, close study view
            if (currentSetId === set.id) {
              closeStudyView();
            }
          }, 300);
        } catch (error) {
          console.error('Error deleting flashcard set:', error);
          alert('Failed to delete flashcard set. Please try again.');
        }
      }
    });
    
    flashcardSetsGrid.appendChild(setCard);
  }

  // Function to open study view for a set
  function openStudyView(set) {
    currentSetId = set.id;
    setTitle.textContent = set.name;
    flashcardSetsGrid.style.display = 'none';
    document.querySelector('.create-flashcard-section').style.display = 'none';
    flashcardStudyView.style.display = 'block';
    
    // Load and display the flashcards
    if (set.cards && set.cards.length > 0) {
      updateFlashcardsDisplay(set.cards);
    } else {
      showNoFlashcardsState();
    }
  }

  // Function to close study view
  function closeStudyView() {
    currentSetId = null;
    flashcardStudyView.style.display = 'none';
    flashcardSetsGrid.style.display = 'grid';
    document.querySelector('.create-flashcard-section').style.display = 'block';
  }

  // Event Listeners
  if (createSetBtn) {
    createSetBtn.addEventListener('click', () => {
      createFlashcardSet(setNameInput.value);
    });
  }

  if (setNameInput) {
    setNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        createFlashcardSet(setNameInput.value);
      }
    });
  }

  if (backToSetsBtn) {
    backToSetsBtn.addEventListener('click', closeStudyView);
  }

  // Modified file upload handler to work with sets
  if (uploadButton && fileInput) {
    uploadButton.addEventListener('click', () => {
      if (!currentSetId) {
        alert('Please select or create a flashcard set first');
        return;
      }
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
        
        // Update the current set with new flashcards
        await updateSetWithFlashcards(currentSetId, flashcards);
        
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

  // Function to update a set with new flashcards
  async function updateSetWithFlashcards(setId, flashcards) {
    const request = indexedDB.open("auraLearningDB", 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["flashcards"], "readwrite");
      const store = transaction.objectStore("flashcards");
      
      const getRequest = store.get(setId);
      
      getRequest.onsuccess = () => {
        const set = getRequest.result;
        if (set) {
          set.cards = flashcards;
          set.cardCount = flashcards.length;
          set.lastModified = Date.now();
          
          store.put(set);
          
          // Update the card count in the UI
          const setCard = document.querySelector(`[data-set-id="${setId}"]`);
          if (setCard) {
            setCard.querySelector('.set-card-count').textContent = `${flashcards.length} cards`;
          }
        }
      };
    };
  }

  // Function to delete a flashcard set
  async function deleteFlashcardSet(setId) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("auraLearningDB", 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["flashcards"], "readwrite");
        const store = transaction.objectStore("flashcards");
        
        const deleteRequest = store.delete(setId);
        
        deleteRequest.onsuccess = () => {
          console.log(`Flashcard set ${setId} deleted successfully`);
          resolve();
        };
        
        deleteRequest.onerror = () => {
          console.error(`Error deleting flashcard set ${setId}:`, deleteRequest.error);
          reject(deleteRequest.error);
        };
      };
    });
  }

  // Initialize - load existing flashcard sets
  loadFlashcardSets().then(sets => {
    sets.forEach(set => renderFlashcardSet(set));
  }).catch(error => {
    console.error('Error loading flashcard sets:', error);
  });

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