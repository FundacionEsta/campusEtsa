  const loginButton = document.getElementById('loginboton');
        const userMenu = document.getElementById('userMenu');

        if (loginButton) {
            loginButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevents the window click event from firing immediately
                userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
            });
        }
        
        // Hide menu if clicking outside
        window.addEventListener('click', () => {
             if (userMenu && userMenu.style.display === 'block') {
                userMenu.style.display = 'none';
            }
        });