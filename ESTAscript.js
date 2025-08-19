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

    

