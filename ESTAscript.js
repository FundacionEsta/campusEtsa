document.getElementById("loginBtn").addEventListener("click", function() {
    alert("Aquí irá el login con conexión al backend.");
});

// Ejemplo para cargar diplomados (se puede conectar a API después)
const diplomados = ["Diplomado en Educación", "Diplomado en Tecnología", "Diplomado en Gestión"];
document.getElementById("diplomados-list").innerHTML = diplomados.map(d => `<p>${d}</p>`).join("");

// Ejemplo para cursos
const cursos = ["Curso de Excel", "Curso de Programación", "Curso de Liderazgo"];
document.getElementById("cursos-list").innerHTML = cursos.map(c => `<p>${c}</p>`).join("");
