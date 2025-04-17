// Hamburger Menu Toggle with Accessibility Improvements
const menuToggle = document.getElementById('menu-toggle');
const menu = document.querySelector('.menu');

if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        menuToggle.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        menu.setAttribute('aria-hidden', !isOpen);
    });
}

// Enhanced Dark Mode Toggle with System Preference Detection
const colorModeSwitch = document.getElementById('color-mode-switch');
const switchInput = document.getElementById('switch');

function applyColorMode(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        switchInput.checked = true;
        localStorage.setItem('colorMode', 'dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
        switchInput.checked = false;
        localStorage.setItem('colorMode', 'light-mode');
    }
}

// Initialize color mode
const savedMode = localStorage.getItem('colorMode');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedMode) {
    applyColorMode(savedMode === 'dark-mode');
} else {
    applyColorMode(systemPrefersDark);
}

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
    if (!localStorage.getItem('colorMode')) {
        applyColorMode(e.matches);
    }
});

// Toggle handler
if (colorModeSwitch) {
    colorModeSwitch.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-mode');
        applyColorMode(isDark);
    });
}

// Enhanced Login Form with Better Error Handling
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error-message');
        const submitButton = e.target.querySelector('button[type="submit"]');

        // Clear previous errors
        errorElement.textContent = '';
        errorElement.style.display = 'none';

        // Validate inputs
        if (!username || !password) {
            errorElement.textContent = 'Please enter both username and password';
            errorElement.style.display = 'block';
            return;
        }

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Logging in...';

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Login failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.token) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                // Redirect to protected page
                window.location.href = '/calendar.html';
            } else {
                throw new Error(data.message || 'Invalid server response');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = error.message || 'Login failed. Please try again.';
            errorElement.style.display = 'block';

            // Add visual feedback
            e.target.classList.add('shake');
            setTimeout(() => e.target.classList.remove('shake'), 500);
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
}

// FullCalendar Initialization with Real Data Fetching
document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const token = localStorage.getItem('authToken');

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: async function (fetchInfo, successCallback, failureCallback) {
            try {
                const response = await fetch('/api/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const events = await response.json();
                successCallback(events);
            } catch (error) {
                console.error('Error fetching events:', error);
                failureCallback(error);
            }
        },
        aspectRatio: 1.35,
        handleWindowResize: true,
        eventClick: function (info) {
            // Handle event clicks
            console.log('Event clicked:', info.event);
        },
        dateClick: function (info) {
            // Handle date clicks
            console.log('Date clicked:', info.dateStr);
        }
    });

    calendar.render();
});

// Enhanced Trophy Hover Effect with Touch Support
document.addEventListener('DOMContentLoaded', () => {
    const trophies = document.querySelectorAll('.trophy');
    if (!trophies.length) return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints;

    trophies.forEach(trophy => {
        // Mouse events
        trophy.addEventListener('mouseenter', handleTrophyHover);
        trophy.addEventListener('mouseleave', handleTrophyLeave);

        // Touch events for mobile
        if (isTouchDevice) {
            trophy.addEventListener('touchstart', handleTrophyHover, { passive: true });
            trophy.addEventListener('touchend', handleTrophyLeave, { passive: true });
        }
    });

    function handleTrophyHover(e) {
        if (e.type === 'touchstart') e.preventDefault();
        trophies.forEach(t => t.classList.remove('hovered'));
        this.classList.add('hovered');
        this.focus();
    }

    function handleTrophyLeave() {
        this.classList.remove('hovered');
    }
});

// Improved Motivational Quotes with Fade Animation
document.addEventListener('DOMContentLoaded', function () {
    const quoteElement = document.getElementById('current-quote');
    if (!quoteElement) return;

    const quotes = [
        { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
        { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
        { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
        { text: "Winners never quit and quitters never win.", author: "Vince Lombardi" },
        { text: "Persistence can change failure into extraordinary achievement.", author: "Marva Collins" },
        { text: "Nobody who ever gave his best regretted it.", author: "George Halas" },
        { text: "The harder the battle, the sweeter the victory.", author: "Les Brown" },
        { text: "If you can believe it, the mind can achieve it.", author: "Ronnie Lott" }
    ];

    let currentIndex = -1;

    function getRandomQuote() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * quotes.length);
        } while (newIndex === currentIndex && quotes.length > 1);
        currentIndex = newIndex;
        return quotes[currentIndex];
    }

    function displayQuote() {
        const { text, author } = getRandomQuote();

        // Fade out
        quoteElement.style.opacity = 0;

        // Update content after fade out
        setTimeout(() => {
            quoteElement.innerHTML = `${text} <br><small>- ${author}</small>`;
            // Fade in
            quoteElement.style.opacity = 1;
        }, 500);
    }

    // Initial quote
    displayQuote();

    // Auto-rotate every 10 seconds
    let quoteInterval = setInterval(displayQuote, 10000);

    // Manual control
    document.addEventListener('click', function (event) {
        if (event.target.closest('.quote-control')) {
            clearInterval(quoteInterval);
            displayQuote();
            // Restart auto-rotation after delay
            setTimeout(() => {
                quoteInterval = setInterval(displayQuote, 10000);
            }, 30000);
        }
    });

    // Pause on hover
    quoteElement.addEventListener('mouseenter', () => {
        clearInterval(quoteInterval);
    });

    quoteElement.addEventListener('mouseleave', () => {
        clearInterval(quoteInterval);
        quoteInterval = setInterval(displayQuote, 10000);
    });
});