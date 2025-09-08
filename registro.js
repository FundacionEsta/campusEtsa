// La forma correcta y moderna de inicializar el cliente de Supabase.
const { createClient } = supabase;

const supabaseClient = createClient(
    "https://qlsuiwxlrsqgumjbuozk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk"
);

// --- NUEVO: Lógica para censurar ---
let cedulasCensuradas = true; // El estado inicial es censurado
const censorBtn = document.getElementById('censor-btn');

// Función para censurar un número, mostrando solo los últimos 4 dígitos
function censurarCedula(cedula) {
    if (!cedula || cedula.length < 4) {
        return '****';
    }
    return '****' + cedula.slice(-4);
}

// Función para actualizar la vista de todas las cédulas en las tablas
function actualizarVistaCedulas() {
    const celdasCedula = document.querySelectorAll('.cedula-cell'); // Busca todas las celdas con la clase especial
    
    celdasCedula.forEach(celda => {
        const cedulaCompleta = celda.dataset.fullCedula; // Obtiene el número completo del atributo data-*
        if (cedulasCensuradas) {
            celda.textContent = censurarCedula(cedulaCompleta);
        } else {
            celda.textContent = cedulaCompleta;
        }
    });

    // Cambiar el texto del botón
    censorBtn.textContent = cedulasCensuradas ? '🙈 Ocultar Cédulas' : '🙉 Mostrar Cédulas';
}

// --- MODIFICADO: renderizarTabla ahora prepara las celdas para ser censuradas ---
function renderizarTabla(tablaBodyId, datos) {
    const tablaBody = document.getElementById(tablaBodyId);
    if (!tablaBody) {
        console.error(`Error: No se encontró el elemento con el ID '${tablaBodyId}'`);
        return;
    }
    
    tablaBody.innerHTML = ''; // Limpiar la tabla antes de renderizar

    datos.forEach(estudiante => {
        const fila = document.createElement('tr');
        const cedulaOriginal = estudiante.cedula_id || ''; // Usamos la columna correcta: cedula_id

        // MODIFICADO: La celda de la cédula ahora tiene una clase y un atributo data-*
        fila.innerHTML = `
            <td>${estudiante.nombre_usuario || ''}</td>
            <td>${estudiante.nombre_completo || ''}</td>
            <td>${estudiante.correo || ''}</td>
            <td>${estudiante.rol || 'Estudiante'}</td>
            <td class="cedula-cell" data-full-cedula="${cedulaOriginal}">
                ${censurarCedula(cedulaOriginal)}
            </td>
            <td><button class="accion-btn">Eliminar</button></td>
        `;
        tablaBody.appendChild(fila);
    });
}

async function obtenerYMostrarDatos(nombreTabla, tablaBodyId) {
    try {
        const { data, error } = await supabaseClient.from(nombreTabla).select('*'); 

        if (error) {
            console.error(`Error al obtener datos de la tabla '${nombreTabla}':`, error.message);
            return;
        }

        renderizarTabla(tablaBodyId, data);
        actualizarVistaCedulas(); // Asegura que el estado de censura se aplique al cargar

    } catch (error) {
        console.error('Ocurrió un error inesperado:', error.message);
    }
}

// Event listener para el botón de censura
censorBtn.addEventListener('click', () => {
    cedulasCensuradas = !cedulasCensuradas; // Invierte el estado (si es true, se vuelve false y viceversa)
    actualizarVistaCedulas(); // Llama a la función que actualiza la vista
});

// Cargar los datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    obtenerYMostrarDatos('ia_no_programadores', 'tabla-usuarios-programacion');
    obtenerYMostrarDatos('recreacion_con_proposito', 'tabla-usuarios-recreacion');
});