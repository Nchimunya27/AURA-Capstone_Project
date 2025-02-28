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