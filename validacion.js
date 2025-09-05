

  document.getElementById("loginboton").addEventListener("click", function() {
    window.location.href = "login.html";
     });
  
  const loggedUser = localStorage.getItem("loggedUser");

  const loginBtn = document.querySelector(".btn-login");
  if (loggedUser) {
    
    loginBtn.textContent = "👤 " + loggedUser;
    loginBtn.style.backgroundColor = "#4caf50";

    
    loginBtn.onclick = () => {
      localStorage.removeItem("loggedUser");
      alert("Sesión cerrada");
      window.location.reload();
    };
  } else {
    
    loginBtn.onclick = () => {
      window.location.href = "login.html";
    };
  }