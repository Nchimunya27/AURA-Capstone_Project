// Auth utilities for quiz module

// Check if the user is logged in and return user data
async function checkAuth() {
  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error || !user) {
      console.error("Authentication error:", error);
      // Redirect to login
      window.location.href = "/aura-login/login.html";
      return null;
    }

    return user;
  } catch (error) {
    console.error("Authentication check failed:", error);
    // Redirect to login
    window.location.href = "/aura-login/login.html";
    return null;
  }
}

// Logout function
async function logout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    // Clear any stored data
    localStorage.removeItem("currentQuizId");
    localStorage.removeItem("currentAttemptId");

    // Redirect to login
    window.location.href = "/aura-login/login.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Error logging out: " + error.message);
  }
}
