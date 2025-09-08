// La forma correcta y moderna de inicializar el cliente de Supabase.
const { createClient } = supabase;

const supabaseClient = createClient(
    "https://qlsuiwxlrsqgumjbuozk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk"
);

// --- OBTENER ELEMENTOS DEL DOM ---
const censorBtn = document.getElementById('censor-btn');
const userNameBtn = document.getElementById('user-name-btn'); // NUEVO
const homeBtn = document.getElementById('home-btn');           // NUEVO

// Lógica para censurar
let cedulasCensuradas = true;

function censurarCedula(cedula) {
    if (!cedula || cedula.length < 4) {
        return '****';
    }
    return '****' + cedula.slice(-4);
}

function actualizarVistaCedulas() {
    const celdasCedula = document.querySelectorAll('.cedula-cell');

    celdasCedula.forEach(celda => {
        const cedulaCompleta = celda.dataset.fullCedula;
        if (cedulasCensuradas) {
            celda.textContent = censurarCedula(cedulaCompleta);
        } else {
            celda.textContent = cedulaCompleta;
        }
    });

    censorBtn.textContent = cedulasCensuradas ? '🙈 Ocultar Cédulas' : '🙉 Mostrar Cédulas';
}

function renderizarTabla(tablaBodyId, datos) {
    const tablaBody = document.getElementById(tablaBodyId);
    if (!tablaBody) {
        console.error(`Error: No se encontró el elemento con el ID '${tablaBodyId}'`);
        return;
    }

    tablaBody.innerHTML = '';

    datos.forEach(estudiante => {
        const fila = document.createElement('tr');
        const cedulaOriginal = estudiante.cedula_id || '';

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
        actualizarVistaCedulas();

    } catch (error) {
        console.error('Ocurrió un error inesperado:', error.message);
    }
}

// --- EVENT LISTENERS PARA BOTONES DEL HEADER ---

// Event listener para el botón de censura
censorBtn.addEventListener('click', () => {
    cedulasCensuradas = !cedulasCensuradas;
    actualizarVistaCedulas();
});

// Event listener para el botón de inicio (NUEVO)
homeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});


// =================================================================
// LÓGICA DE AUTORIZACIÓN Y CARGA DE PÁGINA
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtenemos los datos del usuario guardados en localStorage.
    const userRole = localStorage.getItem('userRole');
    const loggedUser = localStorage.getItem('loggedUser'); // NUEVO

    // 2. Verificamos si el rol es 'admin'.
    if (userRole === 'admin') {
        // 3. ¡Acceso concedido!
        console.log('Acceso concedido para el administrador.');
        
        // 3.1 Mostramos el nombre de usuario en el header (NUEVO)
        if (loggedUser) {
            userNameBtn.textContent = `👤 ${loggedUser}`;
        } else {
            userNameBtn.textContent = 'Admin';
        }

        // 3.2 Cargamos los datos de las tablas
        obtenerYMostrarDatos('ia_no_programadores', 'tabla-usuarios-programacion');
        obtenerYMostrarDatos('recreacion_con_proposito', 'tabla-usuarios-recreacion');
    } else {
        // 4. ¡Acceso denegado!
        alert('🚫 Acceso denegado. Esta página es solo para administradores.');
        window.location.href = 'login.html';
    }
});