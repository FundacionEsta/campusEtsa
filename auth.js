const loggedUser = localStorage.getItem("loggedUser");
const loginBtn = document.getElementById("loginboton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");

if (loginBtn) {
  if (loggedUser) {
    loginBtn.textContent = "👤 " + loggedUser;
    loginBtn.style.backgroundColor = "#d6ff41";
    loginBtn.style.color = "#5d740cff";

    // Mostrar/ocultar menú al hacer click
    loginBtn.onclick = () => {
      userMenu.style.display =
        userMenu.style.display === "block" ? "none" : "block";
    };

    // Acción de cerrar sesión
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        localStorage.removeItem("loggedUser");
        alert("Sesión cerrada");
        window.location.reload();
      };
    }
  } else {
    loginBtn.onclick = () => {
      window.location.href = "login.html";
    };
  }
}

// Cierra el menú si haces click fuera de él
window.onclick = function (event) {
  if (!event.target.matches("#loginboton")) {
    userMenu.style.display = "none";
  }
};

if (inscribirseBtn) {
  inscribirseBtn.onclick = () => {
    if (loggedUser) {
      // Usuario logeado → redirigir a la página de inscripción
      window.location.href = "inscrirecre.html";
    } else {
      // Usuario no logeado → redirigir a login
      alert("Debes iniciar sesión primero");
      window.location.href = "login.html";
    }
  };
}

// Cierra el menú si haces click fuera de él
window.onclick = function (event) {
  if (!event.target.matches("#loginboton")) {
    userMenu.style.display = "none";
  }
};


