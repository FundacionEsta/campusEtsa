document.addEventListener('DOMContentLoaded', () => {

    // --- 1. OBTENER ELEMENTOS Y DATOS DEL USUARIO ---
    const loggedUser = localStorage.getItem("loggedUser");
    const userRole = localStorage.getItem('userRole');

    const loginBtn = document.getElementById("loginboton");
    const userMenu = document.getElementById("userMenu");
    const logoutBtn = document.getElementById("logoutBtn");
    const inscribirseBtn = document.getElementById("inscribirseBtn");


    // --- 2. LÓGICA PARA MOSTRAR ENLACES SEGÚN EL ROL ---

    // Lógica para rol MAESTRO
    const maestroLink = document.getElementById('nav-maestro-link');
    if (maestroLink && userRole === 'maestro') {
        maestroLink.style.display = 'inline-block';
    }

    // --- NUEVO: LÓGICA PARA MOSTRAR ENLACES DE ADMIN ---
    const adminEditUsersLink = document.getElementById('admin-edit-users-link');
    const adminEnrolledLink = document.getElementById('admin-enrolled-link');
    
    if (userRole === 'admin') {
        if (adminEditUsersLink) {
            adminEditUsersLink.style.display = 'inline-block';
        }
        if (adminEnrolledLink) {
            adminEnrolledLink.style.display = 'inline-block';
        }
    }


    // --- 3. LÓGICA DEL BOTÓN DE LOGIN/USUARIO ---
    if (loginBtn) {
        if (loggedUser) {
            // --- SI EL USUARIO HA INICIADO SESIÓN ---
            loginBtn.textContent = `👤 ${loggedUser}`;
            loginBtn.style.backgroundColor = "#d6ff41";
            loginBtn.style.color = "#5d740cff";

            // Mostrar/ocultar menú al hacer clic
            loginBtn.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita que el clic se propague y cierre el menú inmediatamente
                userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
            });

            // Acción de cerrar sesión
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem("loggedUser");
                    localStorage.removeItem("userRole"); 
                    alert("Sesión cerrada");
                    window.location.reload();
                });
            }

        } else {
            // --- SI EL USUARIO NO HA INICIADO SESIÓN ---
            loginBtn.addEventListener('click', () => {
                window.location.href = "login.html";
            });
        }
    }


    // --- 4. LÓGICA DEL BOTÓN "INSCRIBIRSE" ---
    if (inscribirseBtn) {
        inscribirseBtn.addEventListener('click', () => {
            if (loggedUser) {
                window.location.href = "inscrirecre.html";
            } else {
                alert("Debes iniciar sesión primero");
                window.location.href = "login.html";
            }
        });
    }


    // --- 5. CERRAR EL MENÚ AL HACER CLIC FUERA ---
    window.addEventListener('click', (event) => {
        if (userMenu && userMenu.style.display === 'block') {
            if (!loginBtn.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.style.display = "none";
            }
        }
    });

});