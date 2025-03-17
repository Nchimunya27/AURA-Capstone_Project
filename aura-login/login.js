// Toggle between login and create account forms
function toggleView(view) {
    const createForm = document.getElementById('createAccountForm');
    const loginForm = document.getElementById('loginForm');
    
    if (view === 'create') {
        createForm.classList.add('active');
        loginForm.classList.remove('active');
    } else {
        loginForm.classList.add('active');
        createForm.classList.remove('active');
    }
}

// Name of cache
const CACHE_NAME = 'aura-user-cache';

// Save data to cache with localStorage fallback if cache fails
async function saveData(key, data) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(data));
        await cache.put(`/${key}`, response);
        return true;
    } catch (error) {
        console.log('Cache storage failed, using localStorage fallback', error);
        localStorage.setItem(key, JSON.stringify(data));
        return false;
    }
}

// Get data from cache or localStorage 
async function getData(key) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(`/${key}`);
        
        if (response) {
            const data = await response.json();
            return data;
        }
        
        // If data not in cache, try localStorage
        const localData = localStorage.getItem(key);
        if (localData) {
            const data = JSON.parse(localData);
            saveData(key, data); 
            return data;
        }
        
        return null;
    } catch (error) {
        console.log('Cache retrieval failed, using localStorage fallback', error);
        const localData = localStorage.getItem(key);
        return localData ? JSON.parse(localData) : null;
    }
}

// Remove data from both cache and localStorage
async function removeData(key) {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.delete(`/${key}`);
    } catch (error) {
        console.log('Cache deletion failed', error);
    }
    
    // Also remove from localStorage again
    localStorage.removeItem(key);
}

// Initialize the users array
let users = [];

// Show the status message function
function showStatusMessage(message, isError = false) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = 'status-message ' + (isError ? 'error' : 'success');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        statusElement.className = 'status-message';
    }, 3000);
}

// Handle form submissions
document.addEventListener('DOMContentLoaded', async function() {
    // Load users from cache
    users = await getData('users') || [];
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Create Account Form Submission
    const createAccountForm = document.getElementById('signupForm');
    createAccountForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('newEmail').value;
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        
        // Validation for input
        if (!email || !username || !password) {
            showStatusMessage('Please fill out all fields', true);
            return;
        }
        
        if (password.length < 8) {
            showStatusMessage('Password must be at least 8 characters long', true);
            return;
        }
        
        // Check if username already exists
        if (users.some(user => user.username === username)) {
            showStatusMessage('Username already exists. Please choose a different one.', true);
            return;
        }
        
        // Add new user to the array
        users.push({
            email: email,
            username: username,
            password: password
        });
        
        // Save to cache
        await saveData('users', users);
        
        showStatusMessage('Account created successfully! You can now log in.');
        
        // Clear the form
        createAccountForm.reset();
        
        // Switch to login view
        toggleView('login');
    });
    
    // Login Form Submission
const loginForm = document.getElementById('loginInputForm');
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    console.log("Login attempt for:", username);
    
    // Find user in the array
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        console.log("User found, authentication successful");
        
        // Store user info
        const userData = {
            username: username,
            email: user.email,
            remembered: rememberMe,
            lastLogin: new Date().toISOString()
        };
        
        // If remember me is checked, save for longer term
        if (rememberMe) {
            await saveData('currentUser', userData);
        } else {
            // For session only, use sessionStorage directly
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            // Remove any remembered user from cache
            await removeData('currentUser');
        }
        
        showStatusMessage('Login successful!');

      
        
        setTimeout(() => {
            window.location.href = '../../src-dashboard/src/aura.html';
        }, 1500);
    } else {
        console.log("Authentication failed: Invalid credentials");
        showStatusMessage('Invalid username or password', true);
    }
});

// Function to check if user is logged in
async function checkLoginStatus() {
    // First check sessionStorage (for current session)
    let currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        currentUser = JSON.parse(currentUser);
    } else {
        // If not in session, check cache for remembered user
        currentUser = await getData('currentUser');
    }
    
    if (currentUser) {
        // Display welcome message
        showStatusMessage(`Welcome back, ${currentUser.username}!`);
        
    }
}

// Function to check if user is logged in 
async function isLoggedIn() {
    // First check sessionStorage (for current session)
    let currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        return true;
    }
    
    // If not in session, check cache for remembered user
    currentUser = await getData('currentUser');
    return !!currentUser; 
}

// Protect page function 
async function protectPage() {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
    }
}

// Logout function
async function logout() {
    // Remove current user from session storage
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('isLoggedIn');
    
    // Only remove from cache if user is not "remembered"
    const savedUser = await getData('currentUser');
    if (savedUser && !savedUser.remembered) {
        await removeData('currentUser');
    }
    
    showStatusMessage('Logged out successfully!');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}
});