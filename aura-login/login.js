// login.js - Complete file
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
    
    // Clear any redirect loop protection
    localStorage.removeItem('redirect_loop_protection');
    
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
                            // Store username in localStorage for sign-up as well
                            localStorage.setItem('currentUsername', username);
                            
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
                
                // Store auth data manually for better persistence
                localStorage.setItem('supabase.auth.token', JSON.stringify({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: new Date().getTime() + (data.session.expires_in * 1000)
                }));
                
                // Store user ID for verification
                localStorage.setItem('user_id', data.user.id);
                
                // Get the complete profile data from Supabase to retrieve proper username/name
                try {
                    // Get full profile data to get additional user info
                    const { data: fullProfile, error: profileFetchError } = await supabaseClient
                        .from('profiles')
                        .select('*')  // select all fields
                        .eq('id', data.user.id)
                        .single();
                    
                    if (profileFetchError) {
                        console.error('Error fetching profile:', profileFetchError);
                        // Still store the basic username as fallback
                        localStorage.setItem('currentUsername', username);
                    } else {
                        // Store the full name or preferred display name from profile
                        // Adjust these field names if needed to match your Supabase profiles table
                        if (fullProfile.full_name) {
                            localStorage.setItem('currentUsername', fullProfile.full_name);
                        } else if (fullProfile.username) {
                            localStorage.setItem('currentUsername', fullProfile.username);
                        } else {
                            // Fallback to login username
                            localStorage.setItem('currentUsername', username);
                        }
                        
                        // Store other user data
                        if (fullProfile.first_name) localStorage.setItem('user_firstName', fullProfile.first_name);
                        if (fullProfile.last_name) localStorage.setItem('user_lastName', fullProfile.last_name);
                    }
                } catch (profileError) {
                    console.error('Profile fetch exception:', profileError);
                    // Fallback to login username
                    localStorage.setItem('currentUsername', username);
                }
                
                showStatusMessage('Login successful!');
                
                // Clear any redirect loop protection
                localStorage.removeItem('redirect_loop_protection');
                
                // Redirect after successful login using full URL path
                setTimeout(() => {
                    // Use relative path instead of absolute path
                    const dashboardUrl = '../src-dashboard/src/aura.html';
                    console.log('Redirecting to dashboard:', dashboardUrl);
                    window.location.href = dashboardUrl;
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
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
                showStatusMessage(`Error logging out: ${error.message}`, true);
                return;
            }
            
            // Clear auth data
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('redirect_loop_protection');
            // Also clear the username
            localStorage.removeItem('currentUsername');
            localStorage.removeItem('user_firstName');
            localStorage.removeItem('user_lastName');
            
            showStatusMessage('Logged out successfully!');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } catch (error) {
            console.error('Logout exception:', error);
            showStatusMessage(`Error: ${error.message}`, true);
        }
    };
});