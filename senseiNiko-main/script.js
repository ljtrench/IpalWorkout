// Hamburger Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const menu = document.querySelector('.menu');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('open');
    menuToggle.classList.toggle('open');
});

// Dark Mode Toggle
const colorModeSwitch = document.getElementById('color-mode-switch');
const switchInput = document.getElementById('switch');

// Check for saved preference
const currentMode = localStorage.getItem('colorMode');
if (currentMode) {
    document.body.classList.add(currentMode);
    if (currentMode === 'dark-mode') {
        switchInput.checked = true;
    }
}

colorModeSwitch.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('colorMode', 'light-mode'); // Save preference
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('colorMode', 'dark-mode'); // Save preference
    }
});
// --- Login Form Handling ---
// Enhanced Login Form with better error handling and UX
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error-message');
    const submitButton = e.target.querySelector('button[type="submit"]');

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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.success && data.token) {
            // Store token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

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

// --- FullCalendar Initialization ---
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('calendar')) { // Check if the calendar element exists
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth', // Show month view by default
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay' // Add week and day views
      },
      events: [ // Example events (replace with data from your backend)
        {
          title: 'Event 1',
          start: '2023-12-01',
          allDay : true
        },
        {
          title: 'Event 2',
          start: '2023-12-05T10:00:00',
          end: '2023-12-05T12:00:00'
        },
        {
          title: 'Long Event',
          start: '2023-12-07',
          end: '2023-12-10'
        }
      ],
       //Make the calendar responsive
      aspectRatio: 1.35, // You can adjust this value
      handleWindowResize: true,
    });
    calendar.render();
  }
});

// --- Trophy Hover Effect (Smooth Transition) ---
document.addEventListener('DOMContentLoaded', () => {
    const trophies = document.querySelectorAll('.trophy');

    trophies.forEach(trophy => {
        trophy.addEventListener('mouseenter', () => {
            trophies.forEach(t => t.classList.remove('hovered'));
            trophy.classList.add('hovered');
        });

        trophy.addEventListener('mouseleave', () => {
            trophy.classList.remove('hovered');
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const quotes = [
        "You miss 100% of the shots you don’t take.",
        "The journey of a thousand miles begins with one step.",
        "Believe you can and you're halfway there.",
        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "It’s not whether you get knocked down, it’s whether you get up.",
        "Winners never quit and quitters never win.",
        "Persistence can change failure into extraordinary achievement.",
        "Nobody who ever gave his best regretted it.",
        "The harder the battle, the sweeter the victory.",
        "If you can believe it, the mind can achieve it.",
        "There may be people that have more talent than you, but there’s no excuse for anyone to work harder than you do.",
        "Ever tried. Ever failed. No matter. Try Again. Fail again. Fail better."
    ];

    const quoteElement = document.getElementById('current-quote');

    function updateQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.textContent = quotes[randomIndex];
    }

    // Initial quote on page load
    updateQuote();

    // Automatic rotation every 5 seconds
    setInterval(updateQuote, 5000);

    // Change quote on button clicks
    document.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            updateQuote();
        }
    });

    // Change quote on back/forward navigation
    window.addEventListener('popstate', updateQuote);
});