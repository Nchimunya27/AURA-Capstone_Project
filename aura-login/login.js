document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing username-based login page');
    
    // Initialize Supabase client 
    const supabaseClient = supabase.createClient(
        'https://uumdfsnboqkounadxijq.supabase.co', //URL
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWRmc25ib3Frb3VuYWR4aWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDc5NzMsImV4cCI6MjA1NzkyMzk3M30.s3IDgE3c4kpaiRhCpaKATKdaZzdlTb91heIhrwDZrU0', //anon key
        {
            // Add persistSession option to ensure Supabase persists sessions
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                storageKey: 'supabase.auth.token'
            }
        }
    );
    
    // Check for existing session on page load
    checkAndHandleSession();
    
    // Function to check and handle existing session
    async function checkAndHandleSession() {
        try {
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (session) {
                console.log('Existing session found:', session);
                
                // Get user profile data including username
                const { data: profile, error: profileError } = await supabaseClient
                    .from('profiles')
                    .select('username, email')
                    .eq('id', session.user.id)
                    .single();
                    
                if (profileError) {
                    console.error('Error fetching profile for session:', profileError);
                    return;
                }
                
                if (profile) {
                    console.log('User is logged in as:', profile.username);
                    
                    // Store essential user data in localStorage
                    // This is just for UI purposes, authentication still relies on Supabase session
                    localStorage.setItem('currentUsername', profile.username);
                    localStorage.setItem('user_id', session.user.id);
                    
                    // Redirect to dashboard if on login page
                    if (window.location.pathname.includes('login.html')) {
                        window.location.href = '../src-dashboard/src/aura.html';
                    }
                }
            } else {
                console.log('No active session found');
                // If on a protected page, redirect to login
                if (!window.location.pathname.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            }
        } catch (error) {
            console.error('Session check error:', error);
        }
    }
    
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
    
    // Go through all profiles for debugging purposes
    async function showAllProfiles() {
        try {
            console.log('Fetching all profiles...');
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('*');
                
            if (error) {
                console.error('Error fetching profiles:', error);
                return;
            }
            
            console.log(`Found ${data.length} profiles:`);
            console.table(data);
        } catch (err) {
            console.error('Error showing profiles:', err);
        }
    }
    
    // Run on page load
    showAllProfiles();
    
    // Login Form Submission - username lookup first
    const loginForm = document.getElementById('loginInputForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showStatusMessage('Please enter both username and password', true);
                return;
            }
            
            showStatusMessage('Logging in...');
            
            try {
                // STEP 1: Look up email by username
                console.log('Looking up email for username:', username);
                
                const { data: profileData, error: profileError } = await supabaseClient
                    .from('profiles')
                    .select('email')
                    .eq('username', username)
                    .single();
                
                if (profileError || !profileData || !profileData.email) {
                    console.error('Username lookup error:', profileError);
                    
                    // For debugging, show all usernames
                    const { data: allProfiles } = await supabaseClient
                        .from('profiles')
                        .select('username, email');
                    
                    console.log('Available profiles:', allProfiles);
                    
                    showStatusMessage('Username not found', true);
                    return;
                }
                
                const userEmail = profileData.email;
                console.log('Found email for username:', userEmail);
                
                // STEP 2: Sign in with email/password
                const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
                    email: userEmail,
                    password: password
                });
                
                if (authError) {
                    console.error('Authentication error:', authError);
                    showStatusMessage('Invalid password', true);
                    return;
                }
                
                if (!authData || !authData.user) {
                    showStatusMessage('Login failed: No user data returned', true);
                    return;
                }
                
                console.log('Login successful!');
                showStatusMessage('Login successful!');
                
                // Store minimal user data - authentication will use Supabase session
                localStorage.setItem('user_id', authData.user.id);
                localStorage.setItem('currentUsername', username);
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = '../src-dashboard/src/aura.html';
                }, 1500);
                
            } catch (error) {
                console.error('Login process error:', error);
                showStatusMessage(`Login error: ${error.message}`, true);
            }
        });
    } else {
        console.error('Login form not found. Check your HTML IDs.');
    }
    
    // Create Account Form Submission
    const createAccountForm = document.getElementById('signupForm');
    if (createAccountForm) {
        createAccountForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newEmail').value;
            const username = document.getElementById('newUsername').value;
            const password = document.getElementById('newPassword').value;
            
            if (!email || !username || !password) {
                showStatusMessage('Please fill out all fields', true);
                return;
            }
            
            if (password.length < 8) {
                showStatusMessage('Password must be at least 8 characters long', true);
                return;
            }
            
            showStatusMessage('Creating account...');
            
            try {
                // STEP 1: Check if username already exists
                const { data: existingUser, error: checkError } = await supabaseClient
                    .from('profiles')
                    .select('username')
                    .eq('username', username)
                    .maybeSingle();
                
                if (existingUser) {
                    showStatusMessage('Username already taken. Please choose another.', true);
                    return;
                }
                
                // STEP 2: Create the auth user
                console.log('Creating auth user with email:', email);
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password
                });
                
                if (error) {
                    console.error('Signup error:', error);
                    showStatusMessage(`Error: ${error.message}`, true);
                    return;
                }
                
                if (!data || !data.user) {
                    showStatusMessage('Error: No user data returned', true);
                    return;
                }
                
                const userId = data.user.id;
                console.log('Auth user created with ID:', userId);
                
                // STEP 3: Create profile record
                console.log('Creating profile for user:', username);
                const { error: profileError } = await supabaseClient
                    .from('profiles')
                    .insert({
                        id: userId,
                        username: username,
                        email: email,
                        full_name: username,
                        created_at: new Date().toISOString()
                    });
                
                if (profileError) {
                    console.error('Profile creation error:', profileError);
                    showStatusMessage('Account created but profile setup failed. Please contact support.', true);
                } else {
                    // STEP 4: Verify the profile was created
                    const { data: verifyProfile, error: verifyError } = await supabaseClient
                        .from('profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();
                        
                    if (verifyError || !verifyProfile) {
                        console.error('Profile verification failed:', verifyError);
                        showStatusMessage('Account created but profile verification failed.', true);
                    } else {
                        console.log('Profile created and verified:', verifyProfile);
                        showStatusMessage('Account created successfully!');
                        
                        // STEP 5: Show all profiles for debugging
                        await showAllProfiles();
                        
                        // Clear the form
                        createAccountForm.reset();
                        
                        // Switch to login view
                        toggleView('login');
                    }
                }
            } catch (error) {
                console.error('Signup process error:', error);
                showStatusMessage(`Error: ${error.message}`, true);
            }
        });
    } else {
        console.error('Create account form not found.');
    }
    
    // Improved Logout function
    window.logout = async function() {
        try {
            // First, clear localStorage
            localStorage.removeItem('currentUsername');
            localStorage.removeItem('user_firstName');
            localStorage.removeItem('user_lastName');
            localStorage.removeItem('user_id');
            
            // Then, sign out with Supabase
            const { error } = await supabaseClient.auth.signOut({
                scope: 'global' // Sign out from all tabs/windows
            });
            
            if (error) {
                console.error('Logout error:', error);
                showStatusMessage(`Error logging out: ${error.message}`, true);
                return;
            }
            
            console.log('Successfully logged out from Supabase');
            showStatusMessage('Logged out successfully!');
            
            // Verify that session is gone
            const { data: { session } } = await supabaseClient.auth.getSession();
            console.log('Session after logout:', session); // Should be null
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } catch (error) {
            console.error('Logout exception:', error);
            showStatusMessage(`Error: ${error.message}`, true);
        }
    };
    
    // Add session listener to handle changes in auth state
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_OUT') {
            // Additional cleanup on sign out
            console.log('User signed out, performing cleanup');
            localStorage.clear(); // Clear all localStorage for complete cleanup
            
            // Redirect to login if not already there
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    });
});