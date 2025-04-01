// Notes Tab Fix
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const contentSection = document.querySelector('.content-section');
    const progressSection = document.querySelector('.progress-section');
    
    // Function to handle tab switching
    function switchTab(tabName) {
      // Hide all tab contents first
      tabContents.forEach(tab => {
        tab.style.display = 'none';
      });
      
      // Handle overview special case
      if (tabName === 'overview') {
        // Show the main content sections for overview
        if (contentSection) contentSection.style.display = 'block';
        if (progressSection) progressSection.style.display = 'block';
      } else {
        // Hide main content sections for other tabs
        if (contentSection) contentSection.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        
        // Show the selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
          selectedTab.style.display = 'block';
        }
      }
      
      // Toggle visibility of upload button
      const actionButtons = document.querySelector('.action-buttons');
      if (actionButtons) {
        actionButtons.style.display = (tabName === 'overview') ? 'flex' : 'none';
      }
    }
    
    // Set up click handlers for all nav buttons
    navButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Update active button
        navButtons.forEach(btn => {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Get the tab name and switch to it
        const tabName = this.textContent.trim().toLowerCase();
        switchTab(tabName);
      });
    });
    
    // Initialize with the currently active tab
    const activeButton = document.querySelector('.nav-button.active');
    if (activeButton) {
      const initialTabName = activeButton.textContent.trim().toLowerCase();
      switchTab(initialTabName);
    }

    // Function to read file content
    async function readFileContent(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          resolve(e.target.result);
        };
        
        reader.onerror = function(e) {
          reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
      });
    }

    // Handle file uploads in the notes tab
    const fileInput = document.querySelector('.upload-area input[type="file"]');
    if (fileInput) {
      fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const content = await readFileContent(file);
          const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Store the document in localStorage with more metadata
          const uploadedDocuments = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
          uploadedDocuments.push({
            id: docId,
            name: file.name,
            content: content,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString()
          });
          localStorage.setItem('uploadedDocuments', JSON.stringify(uploadedDocuments));

          // Update the documents display
          updateDocumentsList();
          
          // Clear the file input
          fileInput.value = '';
          
          // Show success message
          alert('Document uploaded successfully!');
          
        } catch (error) {
          console.error('Error reading file:', error);
          alert('Error uploading file: ' + error.message);
        }
      });
    }

    // Function to update the documents list in the UI
    function updateDocumentsList() {
      const documentsGrid = document.querySelector('.documents-grid');
      if (!documentsGrid) return;

      const uploadedDocuments = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
      
      if (uploadedDocuments.length === 0) {
        documentsGrid.innerHTML = `
          <div class="no-documents-message">
            <i class="fas fa-file-alt"></i>
            <p>No documents uploaded yet</p>
          </div>
        `;
        return;
      }

      // Sort documents by upload date (newest first)
      uploadedDocuments.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

      documentsGrid.innerHTML = uploadedDocuments.map(doc => `
        <div class="document-card" data-doc-id="${doc.id}">
          <div class="document-icon ${getIconClass(doc.name)}">
            <i class="fas ${getIconClass(doc.name)}"></i>
          </div>
          <div class="document-info">
            <div class="document-title">${doc.name}</div>
            <div class="document-date">${formatDate(doc.uploadDate)}</div>
          </div>
        </div>
      `).join('');
    }

    // Helper function to get icon class based on file type
    function getIconClass(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      switch (ext) {
        case 'pdf': return 'fa-file-pdf';
        case 'doc':
        case 'docx': return 'fa-file-word';
        case 'txt': return 'fa-file-alt';
        default: return 'fa-file';
      }
    }

    // Helper function to format date
    function formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    // Initial load of documents
    updateDocumentsList();
  });