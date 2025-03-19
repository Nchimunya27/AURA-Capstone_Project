document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client 
    const supabaseClient = supabase.createClient(
        'https://uumdfsnboqkounadxijq.supabase.co', //URL
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWRmc25ib3Frb3VuYWR4aWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDc5NzMsImV4cCI6MjA1NzkyMzk3M30.s3IDgE3c4kpaiRhCpaKATKdaZzdlTb91heIhrwDZrU0' //anon key
    );
    
    console.log('Supabase initialized successfully');
    
    // Toggle between login and create account forms
    window.toggleView = function(view) {
        const createForm = document.getElementById('createAccountForm');
        const loginForm = document.getElementById('loginForm');
        
        if (view === 'create') {
            createForm.classList.add('active');
            loginForm.classList.remove('active');
        } else {
            loginForm.classList.add('active');
            createForm.classList.remove('active');
        }
    };
    
    // Show the status message function 
    function showStatusMessage(message, isError = false) {
        let statusElement = document.getElementById('statusMessage');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'statusMessage';
            document.body.appendChild(statusElement);
        }
        
        statusElement.textContent = message;
        statusElement.className = 'status-message ' + (isError ? 'error' : 'success');
        statusElement.style.display = 'block';
        
        setTimeout(() => {
            statusElement.className = 'status-message';
            statusElement.style.display = 'none';
        }, 3000);
    }
    
    // Check if user is already logged in
    async function checkLoginStatus() {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (session) {
                console.log('User is already logged in:', session.user.id);
                // Don't auto-redirect, just show a message
                showStatusMessage('You are already logged in');
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    }
    
    
    // Create Account Form Submission
    const createAccountForm = document.getElementById('signupForm');
    if (createAccountForm) {
        createAccountForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Sign up form submitted');
            
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
            
            try {
                // Check if username already exists
                const { data: existingUsers, error: userCheckError } = await supabaseClient
                    .from('profiles')
                    .select('username')
                    .eq('username', username)
                    .maybeSingle();
                    
                if (existingUsers) {
                    showStatusMessage('Username already taken. Please choose another.', true);
                    return;
                }
                
                // Sign up with Supabase Auth
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            username: username,
                            full_name: username
                        }
                    }
                });
                
                if (error) throw error;
                
                if (data.user) {
                    // Add user profile to our profiles table
                    try {
                        const { error: profileError } = await supabaseClient
                            .from('profiles')
                            .insert({
                                id: data.user.id,
                                username: username,
                                full_name: username,
                                email: email // Store email for easier login
                            });
                        
                        if (profileError) {
                            console.error('Profile creation error:', profileError);
                            showStatusMessage('Account created but profile setup failed. Please contact support.', true);
                        } else {
                            showStatusMessage('Account created successfully! Please check your email for verification.');
                            
                            // Clear the form
                            createAccountForm.reset();
                            
                            // Switch to login view
                            toggleView('login');
                        }
                    } catch (profileError) {
                        console.error('Profile creation exception:', profileError);
                        showStatusMessage('Account created but profile setup failed. Please contact support.', true);
                    }
                }
            } catch (error) {
                console.error('Signup error:', error);
                showStatusMessage(`Error: ${error.message}`, true);
            }
        });
    } else {
        console.error('Sign up form not found. Check your HTML IDs.');
    }
    
    // Login Form Submission
    const loginForm = document.getElementById('loginInputForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showStatusMessage('Please enter both username and password', true);
                return;
            }
            
            console.log('Attempting login with username:', username);
            
            try {
                // Look up the user's email from profiles
                const { data: profile, error: profileError } = await supabaseClient
                    .from('profiles')
                    .select('email')
                    .eq('username', username)
                    .single();
                
                if (profileError || !profile || !profile.email) {
                    console.error('Profile lookup error:', profileError);
                    showStatusMessage('Invalid username or password', true);
                    return;
                }
                
                console.log('Found email for user:', profile.email);
                
                // Now sign in with the email
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: profile.email,
                    password: password
                });
                
                if (error) {
                    console.error('Auth error:', error);
                    showStatusMessage('Invalid username or password', true);
                    return;
                }
                
                console.log('Login successful:', data);
                showStatusMessage('Login successful!');
                
                // Redirect to dashboard after successful login
                setTimeout(() => {
                    window.location.href = '../../src-dashboard/src/aura.html';
                }, 1500);
            } catch (error) {
                console.error('Login error:', error);
                showStatusMessage(`Error: ${error.message}`, true);
            }
        });
    } else {
        console.error('Login form not found. Check your HTML IDs.');
    }
    
    // Expose the logout function
    window.logout = async function() {
        await supabaseClient.auth.signOut();
        showStatusMessage('Logged out successfully!');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    };
});