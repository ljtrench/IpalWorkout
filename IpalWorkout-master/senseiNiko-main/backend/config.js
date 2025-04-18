// config.js (create this new file)
export const config = {
    apiBaseUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://your-backend-api.com'
};

// login.js (your enhanced login handler)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form elements
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error-message');
        const submitButton = e.target.querySelector('button[type="submit"]');

        // Validate inputs
        if (!username || !password) {
            showError(errorElement, 'Please enter both username and password');
            return;
        }

        // Show loading state
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Logging in...';

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include' // Only if using cookies
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Login failed (${response.status})`);
            }

            const data = await response.json();

            if (data.success && data.token) {
                handleSuccessfulLogin(data);
            } else {
                throw new Error(data.message || 'Invalid server response');
            }
        } catch (error) {
            handleLoginError(error, errorElement, loginForm);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
});

// Helper functions
function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function handleSuccessfulLogin(data) {
    // Store tokens securely
    localStorage.setItem('authToken', data.token);
    sessionStorage.setItem('sessionToken', data.token);

    // Store minimal user data
    const userData = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email
    };
    localStorage.setItem('user', JSON.stringify(userData));

    // Redirect
    window.location.href = '/calendar.html';
}

function handleLoginError(error, errorElement, form) {
    console.error('Login error:', error);
    showError(errorElement, error.message || 'Login failed. Please try again.');

    // Visual feedback
    form.classList.add('shake');
    setTimeout(() => form.classList.remove('shake'), 500);
}