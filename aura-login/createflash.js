document.addEventListener('DOMContentLoaded', function() {
    // Save button functionality
    const saveButton = document.querySelector('.save-button');
    saveButton.addEventListener('click', function() {
        const frontContent = document.querySelector('.front .card-content').value;
        const backContent = document.querySelector('.back .card-content').value;
        
        if (!frontContent || !backContent) {
            alert('Please fill out both sides of the flashcard.');
            return;
        }
        
        const courseSelect = document.querySelector('.option-group:nth-child(1) .option-select');
        const topicSelect = document.querySelector('.option-group:nth-child(2) .option-select');
        
        if (courseSelect.selectedIndex === 0) {
            alert('Please select a course.');
            return;
        }
        
        if (topicSelect.selectedIndex === 0) {
            alert('Please select a topic.');
            return;
        }
        
        // In a real application, you would save the flashcard data to a database here
        console.log('Saving flashcard:', {
            front: frontContent,
            back: backContent,
            course: courseSelect.value,
            topic: topicSelect.value,
            difficulty: document.querySelector('.option-group:nth-child(3) .option-select').value
        });
        
        alert('Flashcard saved successfully!');
        
        // Clear the form
        document.querySelector('.front .card-content').value = '';
        document.querySelector('.back .card-content').value = '';
        courseSelect.selectedIndex = 0;
        topicSelect.selectedIndex = 0;
    });
    
    // Add image button functionality
    const addImageButtons = document.querySelectorAll('.tool-button:nth-child(1)');
    addImageButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real application, you would open a file picker here
            alert('Image upload functionality would be implemented here.');
        });
    });
    
    // Add audio button functionality
    const addAudioButtons = document.querySelectorAll('.tool-button:nth-child(2)');
    addAudioButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real application, you would open a file picker or recording interface here
            alert('Audio recording/upload functionality would be implemented here.');
        });
    });
});