
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