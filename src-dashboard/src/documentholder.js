// Document Management for Course Pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a course page
    if (!document.querySelector('.course-title')) {
      return; // Not on course page, exit
    }
  
    console.log("Document manager initializing...");
  
    // Get current course data from URL or localStorage
    let currentCourse = null;
    const DOCS_CACHE_NAME = 'aura-documents-cache';
    let documents = {};
  
    // Get course ID from URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const courseIdFromUrl = urlParams.get('id');
    
    // Load course data from localStorage
    const courseData = localStorage.getItem('currentCourse');
    if (courseData) {
      currentCourse = JSON.parse(courseData);
      
      // If we have a course ID from URL but it doesn't match the localStorage course,
      // we need to make sure we're using the correct course
      if (courseIdFromUrl && courseIdFromUrl !== currentCourse.id) {
        // Try to find this course in the courses array
        const coursesData = localStorage.getItem('courses');
        if (coursesData) {
          const courses = JSON.parse(coursesData);
          const matchingCourse = courses.find(c => c.id === courseIdFromUrl);
          
          if (matchingCourse) {
            // Create a full course object
            currentCourse = {
              id: matchingCourse.id,
              name: matchingCourse.name,
              knowledgeLevel: matchingCourse.knowledgeLevel || "0",
              examDate: matchingCourse.examDate || "Not scheduled",
              subject: matchingCourse.subject || '',
              studyHours: matchingCourse.studyHours || '',
              subtitle: "Introduction to " + matchingCourse.name
            };
            
            // Update localStorage for future use
            localStorage.setItem('currentCourse', JSON.stringify(currentCourse));
          }
        }
      }
      
      console.log("Current course loaded:", currentCourse);
    } else if (courseIdFromUrl) {
      // If we have a course ID from URL but no course in localStorage,
      // try to find this course in the courses array
      const coursesData = localStorage.getItem('courses');
      if (coursesData) {
        const courses = JSON.parse(coursesData);
        const matchingCourse = courses.find(c => c.id === courseIdFromUrl);
        
        if (matchingCourse) {
          // Create a full course object
          currentCourse = {
            id: matchingCourse.id,
            name: matchingCourse.name,
            knowledgeLevel: matchingCourse.knowledgeLevel || "0",
            examDate: matchingCourse.examDate || "Not scheduled",
            subject: matchingCourse.subject || '',
            studyHours: matchingCourse.studyHours || '',
            subtitle: "Introduction to " + matchingCourse.name
          };
          
          // Update localStorage for future use
          localStorage.setItem('currentCourse', JSON.stringify(currentCourse));
          
          console.log("Current course loaded from URL:", currentCourse);
        }
      }
    } else {
      // Default course ID for development
      currentCourse = { id: 'default-course' };
      console.log("Using default course for development");
    }

    // Ensure document storage is properly initialized
    ensureDocumentStorage();
  
    // Keep track of elements that already have listeners
    const listenersAttached = new Set();

    // Helper function to ensure document storage is properly set up
    function ensureDocumentStorage() {
      console.log("Ensuring document storage is set up correctly");
      
      // Check if documents variable is initialized
      if (!documents || typeof documents !== 'object') {
        documents = {};
      }
      
      // Check localStorage for existing documents
      const localDocs = localStorage.getItem('auraDocuments');
      
      if (localDocs) {
        try {
          // Try to parse existing documents
          const parsedDocs = JSON.parse(localDocs);
          
          // If valid, use them
          if (parsedDocs && typeof parsedDocs === 'object') {
            documents = parsedDocs;
          }
        } catch (e) {
          console.error("Error parsing documents from localStorage:", e);
          // If localStorage is corrupted, reset it
          localStorage.setItem('auraDocuments', JSON.stringify({}));
        }
      } else {
        // If no documents in localStorage, initialize with empty object
        localStorage.setItem('auraDocuments', JSON.stringify({}));
      }
      
      // Ensure the current course has a document array
      if (currentCourse && currentCourse.id && !documents[currentCourse.id]) {
        documents[currentCourse.id] = [];
        // Save the updated documents object back to localStorage
        localStorage.setItem('auraDocuments', JSON.stringify(documents));
      }
      
      console.log("Document storage initialized:", documents);
    }

    // Set up document upload functionality
    function setupDocumentUpload() {
      // Set up browse button
      const browseBtn = document.querySelector('.browse-btn');
      if (browseBtn && !listenersAttached.has('browse-btn')) {
        // Remove any existing listeners
        const newBrowseBtn = browseBtn.cloneNode(true);
        browseBtn.parentNode.replaceChild(newBrowseBtn, browseBtn);
        
        newBrowseBtn.addEventListener('click', function(e) {
          console.log("Browse button clicked");
          // Prevent default to avoid any form submission
          e.preventDefault();
          e.stopPropagation();
          
          // Remove any existing file inputs first
          const existingInputs = document.querySelectorAll('input[type="file"]');
          existingInputs.forEach(input => input.remove());
          
          // Create a new file input element
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf,.doc,.docx,.txt';
          input.style.display = 'none';
          
          // Add the change event listener before appending to DOM
          input.addEventListener('change', function(e) {
            e.stopPropagation();
            if (this.files && this.files.length > 0) {
              const file = this.files[0];
              console.log("File selected from browse button:", file.name);
              handleFileUpload(file);
            }
            // Remove the input element after selection
            if (this.parentNode) {
              this.parentNode.removeChild(this);
            }
          }, { once: true }); // Use once: true to ensure the listener is removed after first use
          
          // Append to body and trigger click
          document.body.appendChild(input);
          input.click();
        });
        
        listenersAttached.add('browse-btn');
      }
      
      // Set up drag and drop
      const uploadArea = document.querySelector('.upload-area');
      if (uploadArea && !listenersAttached.has('upload-area')) {
        console.log("Upload area found, adding drag/drop handlers");
        
        // Prevent default behavior for drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          uploadArea.addEventListener(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
          });
        });
        
        // Visual feedback for drag events
        uploadArea.addEventListener('dragover', function() {
          this.style.borderColor = 'var(--link-color, #5997ac)';
          this.style.backgroundColor = 'rgba(89, 151, 172, 0.1)';
        });
        
        uploadArea.addEventListener('dragleave', function() {
          this.style.borderColor = '#64748b';
          this.style.backgroundColor = 'transparent';
        });
        
        // Handle file drop
        uploadArea.addEventListener('drop', function(e) {
          this.style.borderColor = '#64748b';
          this.style.backgroundColor = 'transparent';
          
          if (e.dataTransfer.files.length > 0) {
            console.log("Processing dropped file:", e.dataTransfer.files[0].name);
            handleFileUpload(e.dataTransfer.files[0]);
          }
        });
        
        // Mark this element as having listeners
        listenersAttached.add('upload-area');
      }
    }
  
    // Handle file upload
    function handleFileUpload(file) {
      if (!file) {
        console.error("No file provided to handleFileUpload");
        return;
      }
      
      console.log("Handling file upload for:", file.name);
      
      // Generate unique ID for the document
      const docId = 'doc_' + Date.now();
      
      // Read the file
      const reader = new FileReader();
      
      // Set up onload before starting the read operation
      reader.onload = function(e) {
        console.log("File read successfully");
        
        try {
          // Create document object
          const doc = {
            id: docId,
            name: file.name,
            type: file.type,
            size: file.size,
            content: e.target.result,
            courseId: currentCourse.id,
            uploadDate: new Date().toISOString()
          };
          
          // Save document to storage
          saveDocument(doc);
          
          // Force a refresh of document displays
          refreshDocumentDisplays();
          
          // Create success notification
          showSuccessNotification(file.name);
        } catch (error) {
          console.error("Error processing uploaded file:", error);
          showErrorNotification(file.name);
        }
      };
      
      reader.onerror = function(e) {
        console.error("Error reading file:", e);
        // Show error notification
        showErrorNotification(file.name);
      };
      
      // Read file as data URL
      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error starting file read:", error);
        showErrorNotification(file.name);
      }
    }
    
    // Function to explicitly refresh document displays
    function refreshDocumentDisplays() {
      console.log("Refreshing document displays");
      displayDocuments();
    }
    
    // Show success notification
    function showSuccessNotification(fileName) {
      const notification = document.createElement('div');
      notification.className = 'upload-notification success';
      notification.innerHTML = `
        <div class="notification-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="notification-message">
          <h3>Upload Successful</h3>
          <p>${fileName} has been uploaded.</p>
        </div>
        <div class="notification-close">
          <i class="fas fa-times"></i>
        </div>
      `;
      
      //Styles 
      if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
          .upload-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            min-width: 300px;
            padding: 15px;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 5px;
            display: flex;
            align-items: center;
            z-index: 1000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
          }
          .upload-notification.success {
            border-left: 4px solid #4caf50;
          }
          .upload-notification.error {
            border-left: 4px solid #f44336;
          }
          .upload-notification.show {
            transform: translateY(0);
            opacity: 1;
          }
          .notification-icon {
            margin-right: 15px;
            font-size: 24px;
          }
          .upload-notification.success .notification-icon {
            color: #4caf50;
          }
          .upload-notification.error .notification-icon {
            color: #f44336;
          }
          .notification-message h3 {
            margin: 0 0 5px 0;
            font-size: 16px;
          }
          .notification-message p {
            margin: 0;
            font-size: 14px;
            opacity: 0.7;
          }
          .notification-close {
            margin-left: auto;
            cursor: pointer;
            opacity: 0.5;
          }
          .notification-close:hover {
            opacity: 1;
          }

          /* Style for empty document lists */
          .empty-message {
            padding: 20px;
            text-align: center;
            color: #666;
            font-style: italic;
          }

          /* Hide Upload Document button */
          .action-buttons {
            display: none;
          }
        `;
        document.head.appendChild(styles);
      }
      
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 5000);
      
      // Handle close button
      notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      });
    }
    
    // Show error notification
    function showErrorNotification(fileName) {
      const notification = document.createElement('div');
      notification.className = 'upload-notification error';
      notification.innerHTML = `
        <div class="notification-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="notification-message">
          <h3>Upload Failed</h3>
          <p>Could not upload ${fileName}.</p>
        </div>
        <div class="notification-close">
          <i class="fas fa-times"></i>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => {
        notification.classList.add('show');
      }, 10);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 5000);
      
      // Handle close button
      notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      });
    }
  
    // Save document to storage
    function saveDocument(doc) {
      console.log("Saving document:", doc.name);
      
      // Load existing documents first
      const localDocs = localStorage.getItem('auraDocuments');
      if (localDocs) {
        try {
          documents = JSON.parse(localDocs);
        } catch (e) {
          console.error("Error parsing documents from localStorage:", e);
          documents = {};
        }
      }
      
      // Make sure we have an array for this course
      if (!documents[doc.courseId]) {
        documents[doc.courseId] = [];
      }
      
      // Add document to array
      documents[doc.courseId].push(doc);
      
      // Save to localStorage
      localStorage.setItem('auraDocuments', JSON.stringify(documents));
      
      // Also try to save to cache if available
      if ('caches' in window) {
        const docBlob = new Blob([JSON.stringify(documents)], { type: 'application/json' });
        const docResponse = new Response(docBlob);
        
        caches.open(DOCS_CACHE_NAME).then(cache => {
          cache.put('/documents-data', docResponse);
        }).catch(error => {
          console.error('Error saving to cache:', error);
        });
      }
    }
  
    // Load documents from storage
    function loadDocuments() {
      console.log("Loading documents from storage");
      
      // Try localStorage first
      const localDocs = localStorage.getItem('auraDocuments');
      if (localDocs) {
        try {
          documents = JSON.parse(localDocs);
          displayDocuments();
        } catch (e) {
          console.error("Error parsing documents from localStorage:", e);
          // Initialize with empty object if parse failed
          documents = {};
          localStorage.setItem('auraDocuments', JSON.stringify(documents));
        }
      } else {
        // Initialize with empty object if no documents found
        documents = {};
        localStorage.setItem('auraDocuments', JSON.stringify(documents));
      }
      
      // Check if we have documents for this course already
      if (!documents[currentCourse.id]) {
        // Initialize course documents array
        documents[currentCourse.id] = [];
        localStorage.setItem('auraDocuments', JSON.stringify(documents));
      }
      
      // Also check cache if available
      if ('caches' in window) {
        caches.open(DOCS_CACHE_NAME).then(cache => {
          return cache.match('/documents-data');
        }).then(response => {
          if (response) {
            return response.json();
          }
          return null;
        }).then(data => {
          if (data) {
            documents = data;
            displayDocuments();
          }
        }).catch(error => {
          console.error('Error loading from cache:', error);
        });
      }
      
      // Display documents regardless of cache result
      displayDocuments();
    }
  
    // Display documents in the UI
    function displayDocuments() {
      console.log("Displaying documents in UI");
      
      // Get document containers first and log their existence
      const recentDocsGrid = document.querySelector('.documents-grid');
      const docList = document.querySelector('.document-list');
      
      console.log("Document containers found:", {
        recentDocsGrid: recentDocsGrid ? true : false,
        docList: docList ? true : false
      });
      
      // Exit if no containers found
      if (!recentDocsGrid && !docList) {
        console.error("Document containers not found in DOM");
        return;
      }
      
      // Clear existing content
      if (recentDocsGrid) recentDocsGrid.innerHTML = '';
      if (docList) docList.innerHTML = '';
      
      // Check if we have documents for this course
      if (!documents[currentCourse.id] || documents[currentCourse.id].length === 0) {
        console.log("No documents found for course ID:", currentCourse.id);
        
        // Add placeholder message
        if (recentDocsGrid) {
          recentDocsGrid.innerHTML = '<div class="empty-message">No recent documents</div>';
        }
        
        if (docList) {
          docList.innerHTML = '<div class="empty-message">No course documents</div>';
        }
        
        return;
      }
      
      // Get documents for current course
      const courseDocuments = documents[currentCourse.id];
      console.log("Found", courseDocuments.length, "documents for this course");
      
      try {
        // Sort by date (newest first)
        const sortedDocs = [...courseDocuments].sort((a, b) => {
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        });
        
        // Add documents to UI
        sortedDocs.forEach(doc => {
          addDocumentToUI(doc);
        });
      } catch (error) {
        console.error("Error displaying documents:", error);
      }
    }
  
    // Add document to UI
    function addDocumentToUI(doc) {
      console.log("Adding document to UI:", doc.name);
      
      // Get file type for icon
      const fileType = doc.name.split('.').pop().toLowerCase();
      let iconClass = 'docx-icon'; // Default
      let iconType = 'fa-file-alt'; // Default
      
      // Set icon based on file type
      if (fileType === 'pdf') {
        iconClass = 'pdf-icon';
        iconType = 'fa-file-pdf';
      } else if (fileType === 'doc' || fileType === 'docx') {
        iconClass = 'docx-icon';
        iconType = 'fa-file-word';
      } else if (fileType === 'ppt' || fileType === 'pptx') {
        iconClass = 'ppt-icon';
        iconType = 'fa-file-powerpoint';
      } else if (fileType === 'txt') {
        iconClass = 'txt-icon';
        iconType = 'fa-file-alt';
      }
      
      // Format time ago
      const timeAgo = getTimeAgo(doc.uploadDate);
      
      // Add to Recent Documents grid
      const recentDocsGrid = document.querySelector('.documents-grid');
      if (recentDocsGrid) {
        const docCard = document.createElement('div');
        docCard.className = 'document-card';
        docCard.dataset.docId = doc.id;
        
        docCard.innerHTML = `
          <div class="document-icon ${iconClass}">
            <i class="fas ${iconType}"></i>
          </div>
          <div class="document-info">
            <h3 class="document-title">${doc.name}</h3>
            <p class="document-date">Updated ${timeAgo}</p>
          </div>
        `;
        
        docCard.addEventListener('click', function() {
          openDocument(doc);
        });
        
        recentDocsGrid.appendChild(docCard);
      }
      
      // Add to Course Documents list
      const docList = document.querySelector('.document-list');
      if (docList) {
        const docItem = document.createElement('div');
        docItem.className = 'document-item';
        docItem.dataset.docId = doc.id;
        
        docItem.innerHTML = `
          <div class="document-item-left">
            <div class="document-icon ${iconClass}">
              <i class="fas ${iconType}"></i>
            </div>
            <div class="document-info">
              <h3 class="document-title">${doc.name}</h3>
              <p class="document-date">Added ${timeAgo}</p>
            </div>
          </div>
          <div class="document-download">
            <i class="fas fa-download"></i>
          </div>
        `;
        
        docItem.querySelector('.document-item-left').addEventListener('click', function() {
          openDocument(doc);
        });
        
        docItem.querySelector('.document-download').addEventListener('click', function(e) {
          e.stopPropagation();
          downloadDocument(doc);
        });
        
        docList.appendChild(docItem);
      }
    }
  
    // Open document
    function openDocument(doc) {
      console.log("Opening document:", doc.name);
      
      if (doc.type === 'application/pdf') {
        const newTab = window.open('', '_blank');
        newTab.document.write(`
          <iframe src="${doc.content}" style="width:100%;height:100%;border:none;"></iframe>
        `);
        newTab.document.title = doc.name;
      } else {
        downloadDocument(doc);
      }
    }
  
    // Download document
    function downloadDocument(doc) {
      console.log("Downloading document:", doc.name);
      
      const a = document.createElement('a');
      a.href = doc.content;
      a.download = doc.name;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  
    // Format time ago
    function getTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 0) {
        return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`;
      } else if (diffHour > 0) {
        return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
      } else if (diffMin > 0) {
        return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
      } else {
        return 'just now';
      }
    }
  
    // Make sure document display is updated when Notes tab is selected
    const navButtons = document.querySelectorAll('.course-nav .nav-button');
    navButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabName = this.textContent.trim().toLowerCase();
        if (tabName === 'notes') {
          console.log("Notes tab selected, refreshing document display");
          // When Notes tab is selected, refresh documents after a short delay
          setTimeout(() => {
            setupDocumentUpload();
            loadDocuments();
          }, 100);
        }
      });
    });
  
    // Initialize functionality
    setupDocumentUpload();
    loadDocuments();
    
    // Also handle Upload button in header (if present)
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn && !listenersAttached.has('upload-btn')) {
      // Remove any existing listeners
      const newUploadBtn = uploadBtn.cloneNode(true);
      uploadBtn.parentNode.replaceChild(newUploadBtn, uploadBtn);
      
      newUploadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Upload button clicked");
        
        // Show Notes tab
        const notesBtn = Array.from(document.querySelectorAll('.course-nav .nav-button'))
          .find(btn => btn.textContent.trim().toLowerCase() === 'notes');
        
        if (notesBtn) {
          notesBtn.click();
        }
        
        // Remove any existing file inputs first
        const existingInputs = document.querySelectorAll('input[type="file"]');
        existingInputs.forEach(input => input.remove());
        
        // Create new file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        input.style.display = 'none';
        
        // Add the change event listener before appending to DOM
        input.addEventListener('change', function(e) {
          e.stopPropagation();
          if (this.files && this.files.length > 0) {
            const file = this.files[0];
            console.log("File selected from upload button:", file.name);
            handleFileUpload(file);
          }
          // Remove the input element after selection
          if (this.parentNode) {
            this.parentNode.removeChild(this);
          }
        }, { once: true }); // Use once: true to ensure the listener is removed after first use
        
        // Append to body and trigger click
        document.body.appendChild(input);
        input.click();
      });
      
      listenersAttached.add('upload-btn');
    }
});