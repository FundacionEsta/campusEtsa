document.getElementById("categorySelect").addEventListener("change", filterCards);
document.getElementById("searchBtn").addEventListener("click", filterCards);

function filterCards() {
    let category = document.getElementById("categorySelect").value;
    let searchText = document.getElementById("searchInput").value.toLowerCase();
    let cards = document.querySelectorAll(".curso-card");

    cards.forEach(card => {
        let matchesCategory = (category === "todos" || card.dataset.type === category);
        let matchesSearch = card.querySelector("h3").textContent.toLowerCase().includes(searchText);
        card.style.display = (matchesCategory && matchesSearch) ? "block" : "none";
    });
}

    
document.getElementById("recreacion").addEventListener("click", function() {
    window.location.href = "recreacion.html";
     });

 const imagenes = ["recreacion1.png", "recreacion2.png", "recreacion3.png"]; 
    let indice = 0;

    const img = document.getElementById("imagen-carrusel");
    const flechaIzq = document.getElementById("flecha-izq");
    const flechaDer = document.getElementById("flecha-der");

    flechaIzq.addEventListener("click", () => {
      indice = (indice - 1 + imagenes.length) % imagenes.length;
      img.src = imagenes[indice];
    });

    flechaDer.addEventListener("click", () => {
      indice = (indice + 1) % imagenes.length;
      img.src = imagenes[indice];
    });

