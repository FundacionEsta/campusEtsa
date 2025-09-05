document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN Y ELEMENTOS DEL DOM ---
    const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co"; 
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk"; 
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const nombreUsuarioSpan = document.getElementById('nombre-usuario');
    const cursosGrid = document.getElementById('cursos-grid');
    const calificacionesGrid = document.getElementById('calificaciones-grid');
    const cursosMensaje = document.getElementById('cursos-mensaje');
    const calificacionesMensaje = document.getElementById('calificaciones-mensaje');
    
    const btnCursos = document.getElementById('btn-cursos');
    const btnCalificaciones = document.getElementById('btn-calificaciones');
    const cursosSection = document.getElementById('cursos-activos-section');
    const calificacionesSection = document.getElementById('calificaciones-section');

    // --- VERIFICACIÓN DE LOGIN ---
    const loggedUser = localStorage.getItem("loggedUser");
    if (!loggedUser) {
        alert("Debes iniciar sesión para acceder al campus.");
        window.location.href = "login.html";
        return;
    }
    nombreUsuarioSpan.textContent = loggedUser;

    // --- DICCIONARIO DE CURSOS (Para asociar imágenes y nombres) ---
    const infoCursos = {
        'ia_no_programadores': {
            nombre: 'Introducción a la IA para no programadores',
            imagen: 'IA.png'
        },
        'recreacion_con_proposito': {
            nombre: 'Recreación con Propósito',
            imagen: 'recreacion.png'
        }
        // Agrega aquí más cursos si los tienes
    };

    // --- FUNCIÓN PRINCIPAL PARA CARGAR DATOS ---
    async function cargarDatosDelCampus() {
        try {
            // --- Cargar Cursos Inscritos ---
            const tablasCursos = ['ia_no_programadores', 'recreacion_con_proposito'];
            const promesasCursos = tablasCursos.map(tabla =>
                supabaseClient
                    .from(tabla)
                    .select('nombre_usuario')
                    .eq('nombre_usuario', loggedUser)
            );
            const resultados = await Promise.all(promesasCursos);
            
            const cursosInscritos = [];
            resultados.forEach((res, index) => {
                if (res.data && res.data.length > 0) {
                    cursosInscritos.push(tablasCursos[index]);
                }
            });

            renderizarCursos(cursosInscritos);

            // --- Cargar Calificaciones ---
            const { data: calificaciones, error: errorCalificaciones } = await supabaseClient
                .from('calificaciones')
                .select('*')
                .eq('nombre_usuario', loggedUser);

            if (errorCalificaciones) throw errorCalificaciones;
            
            renderizarCalificaciones(calificaciones);

        } catch (error) {
            console.error("Error cargando datos del campus:", error);
            cursosMensaje.textContent = "Error al cargar tus cursos.";
            calificacionesMensaje.textContent = "Error al cargar tus calificaciones.";
        }
    }

    // --- FUNCIONES PARA RENDERIZAR (DIBUJAR) EL CONTENIDO ---
    function renderizarCursos(nombresDeTablas) {
        if (nombresDeTablas.length === 0) {
            cursosMensaje.textContent = "Aún no te has inscrito a ningún curso.";
            return;
        }
        
        cursosGrid.innerHTML = ''; // Limpiar el mensaje de "cargando"
        nombresDeTablas.forEach(nombreTabla => {
            const curso = infoCursos[nombreTabla];
            if (curso) {
                const progreso = Math.floor(Math.random() * 81) + 10; // Progreso aleatorio para el demo
                const cardHTML = `
                    <div class="curso-card-campus">
                        <img src="${curso.imagen}" alt="Imagen de ${curso.nombre}">
                        <div class="curso-card-campus-content">
                            <h3>${curso.nombre}</h3>
                            <p>Progreso: ${progreso}%</p>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${progreso}%;"></div>
                            </div>
                        </div>
                    </div>
                `;
                cursosGrid.innerHTML += cardHTML;
            }
        });
    }

    function renderizarCalificaciones(calificaciones) {
        if (calificaciones.length === 0) {
            calificacionesMensaje.textContent = "Aún no tienes calificaciones registradas.";
            return;
        }

        calificacionesGrid.innerHTML = ''; // Limpiar
        let tableHTML = `
            <table class="calificaciones-table">
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Nota</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
        `;
        calificaciones.forEach(cal => {
            const estadoClass = cal.estado.toLowerCase().replace(' ', '-');
            tableHTML += `
                <tr>
                    <td>${cal.curso_nombre}</td>
                    <td>${cal.nota}/100</td>
                    <td><span class="status-badge ${estadoClass}">${cal.estado}</span></td>
                    <td>${cal.fecha_actualizacion}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        calificacionesGrid.innerHTML = tableHTML;
    }

    // --- LÓGICA DE NAVEGACIÓN POR PESTAÑAS ---
    btnCursos.addEventListener('click', () => {
        cursosSection.classList.add('active');
        calificacionesSection.classList.remove('active');
        btnCursos.classList.add('active');
        btnCalificaciones.classList.remove('active');
    });

    btnCalificaciones.addEventListener('click', () => {
        calificacionesSection.classList.add('active');
        cursosSection.classList.remove('active');
        btnCalificaciones.classList.add('active');
        btnCursos.classList.remove('active');
    });

    // --- INICIAR LA CARGA DE DATOS ---
    cargarDatosDelCampus();
});
