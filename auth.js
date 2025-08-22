const loggedUser = localStorage.getItem("loggedUser");
const loginBtn = document.getElementById("loginboton");
const userMenu = document.getElementById("userMenu");
const logoutBtn = document.getElementById("logoutBtn");

if (loginBtn) {
  if (loggedUser) {
    loginBtn.textContent = "👤 " + loggedUser;
    loginBtn.style.backgroundColor = "#4caf50";

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

