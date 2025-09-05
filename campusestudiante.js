document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. CONFIGURACIÓN INICIAL ---
    const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk";
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- MAPA DE CONFIGURACIÓN DE CURSOS (REESTRUCTURADO) ---
    // AHORA USAMOS EL NOMBRE DE LA TABLA COMO CLAVE ÚNICA. ¡MUCHO MÁS SEGURO!
    const configuracionCursos = {
        "ia_no_programadores": {
            claseVirtual: { tabla: "clase_virtual_ia_no_programadores", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            materialEstudio: { tabla: "material_estudio_ia_no_programadores", columnaTitulo: "titulo", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            companeros: { tabla: "ia_no_programadores", columnaEstudianteId: "estudiante_id", columnaCurso: "curso_nombre" }
        },
        "recreacion_con_proposito": {
            claseVirtual: { tabla: "clase_virtual_recreacion_con_proposito", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            materialEstudio: { tabla: "material_estudio_recreacion_con_proposito", columnaTitulo: "titulo", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            companeros: { tabla: "recreacion_con_proposito", columnaEstudianteId: "estudiante_id", columnaCurso: "curso_nombre" }
        }
    };

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const nombreEstudianteSpan = document.getElementById('nombre-estudiante');
    const courseSelector = document.getElementById('course-selector');
    const claseVirtualDisplay = document.getElementById('clase-virtual-display');
    const materialEstudioDisplay = document.getElementById('material-estudio-display');
    const examenesDisplay = document.getElementById('examenes-display');
    const calificacionesDisplay = document.getElementById('calificaciones-display');
    const companerosDisplay = document.getElementById('companeros-display');
    const loggedUser = localStorage.getItem("loggedUser");
    let userId = null;
    let selectedCourse = {
        identificador: null,
        nombreCompleto: null
    };

    // --- LÓGICA PRINCIPAL DE INICIO ---
    (async function init() {
        if (!loggedUser) {
            window.location.href = "login.html";
            return;
        }
        setupLoginAndNavigation();
        try {
            await fetchUserDataAndLoadCourses();
        } catch (err) {
            console.error("Error crítico al iniciar:", err);
            courseSelector.innerHTML = `<option>${err.message}</option>`;
        }
    })();

    // --- DEFINICIÓN DE FUNCIONES ---

    async function fetchUserDataAndLoadCourses() {
        const { data: usuarioData, error: usuarioError } = await supabaseClient.from('usuarios').select('id, usuario, rol').eq('usuario', loggedUser).single();
        if (usuarioError) throw usuarioError;
        if (!usuarioData || !usuarioData.rol.toLowerCase().includes("estudiante")) {
            window.location.href = "login.html";
            return;
        }
        nombreEstudianteSpan.textContent = usuarioData.usuario;
        userId = usuarioData.id;
        await cargarCursosEnSelector();
    }
    
    async function cargarCursosEnSelector() {
        try {
            const consultaIA = supabaseClient.from('ia_no_programadores').select('curso_nombre').eq('estudiante_id', userId);
            const consultaRecreacion = supabaseClient.from('recreacion_con_proposito').select('curso_nombre').eq('estudiante_id', userId);
            const [resIA, resRecreacion] = await Promise.all([consultaIA, consultaRecreacion]);

            if (resIA.error) throw resIA.error;
            if (resRecreacion.error) throw resRecreacion.error;

            // AÑADIMOS EL IDENTIFICADOR A CADA CURSO
            const cursosIA = (resIA.data || []).map(c => ({ ...c, identificador: 'ia_no_programadores' }));
            const cursosRecreacion = (resRecreacion.data || []).map(c => ({ ...c, identificador: 'recreacion_con_proposito' }));

            const cursos = [...cursosIA, ...cursosRecreacion];
            
            // Usamos un Map para asegurar que no haya duplicados por nombre
            const cursosUnicos = Array.from(new Map(cursos.map(c => [c.curso_nombre, c])).values());

            if (cursosUnicos.length === 0) {
                courseSelector.innerHTML = `<option value="" disabled selected>No estás en ningún curso</option>`;
                return;
            }
            
            // El 'value' ahora es el identificador, y el texto es el nombre
            courseSelector.innerHTML = cursosUnicos.map(curso => 
                `<option value="${curso.identificador}">${curso.curso_nombre}</option>`
            ).join('');

            updateSelectedCourse();
            loadContentForActiveSection();

        } catch (err) {
            console.error("Error al cargar cursos:", err);
            courseSelector.innerHTML = `<option value="" disabled selected>Error al cargar</option>`;
        }
    }
    
    courseSelector.addEventListener('change', () => {
        updateSelectedCourse();
        loadContentForActiveSection();
    });

    function updateSelectedCourse() {
        const selectedOption = courseSelector.options[courseSelector.selectedIndex];
        if (selectedOption) {
            selectedCourse.identificador = selectedOption.value;
            selectedCourse.nombreCompleto = selectedOption.text;
        }
    }

    function loadContentForActiveSection() {
        const activeSection = document.querySelector('.campus-nav button.active');
        if (!activeSection || !selectedCourse.identificador) return;
        
        const sectionId = activeSection.dataset.section;
        switch (sectionId) {
            case 'clase-virtual-section': cargarClaseVirtual(selectedCourse.identificador, selectedCourse.nombreCompleto); break;
            case 'material-estudio-section': cargarMaterialEstudio(selectedCourse.identificador, selectedCourse.nombreCompleto); break;
            case 'examenes-section': cargarExamenes(selectedCourse.nombreCompleto); break;
            case 'calificaciones-section': cargarCalificaciones(selectedCourse.nombreCompleto, loggedUser); break;
            case 'companeros-section': cargarCompaneros(selectedCourse.identificador, selectedCourse.nombreCompleto, userId); break;
        }
    }
    
    async function cargarClaseVirtual(identificador, nombreCompleto) {
        claseVirtualDisplay.innerHTML = `<p class="mensaje-vacio">Buscando enlace...</p>`;
        const config = configuracionCursos[identificador]?.claseVirtual;
        if (!config) {
            claseVirtualDisplay.innerHTML = `<p class="mensaje-vacio">Configuración de 'Clase Virtual' no encontrada.</p>`;
            return;
        }
        try {
            const { data, error } = await supabaseClient.from(config.tabla).select(config.columnaEnlace).eq(config.columnaCurso, nombreCompleto).limit(1);
            if (error) throw error;
            const enlace = data?.[0]?.[config.columnaEnlace];
            if (enlace) {
                claseVirtualDisplay.innerHTML = `<ul class="material-list"><li><span>Enlace a la clase</span><a href="${enlace}" target="_blank">Unirse</a></li></ul>`;
            } else {
                claseVirtualDisplay.innerHTML = `<p class="mensaje-vacio">No hay enlace de clase virtual para este curso.</p>`;
            }
        } catch (err) {
            claseVirtualDisplay.innerHTML = `<p class="mensaje-vacio">Error al cargar el enlace.</p>`;
        }
    }

    async function cargarMaterialEstudio(identificador, nombreCompleto) {
        materialEstudioDisplay.innerHTML = `<p class="mensaje-vacio">Buscando material...</p>`;
        const config = configuracionCursos[identificador]?.materialEstudio;
        if (!config) {
            materialEstudioDisplay.innerHTML = `<p class="mensaje-vacio">Configuración de 'Material' no encontrada.</p>`;
            return;
        }
        try {
            const { data, error } = await supabaseClient.from(config.tabla).select(`${config.columnaTitulo}, ${config.columnaEnlace}`).eq(config.columnaCurso, nombreCompleto);
            if (error) throw error;
            if (data && data.length > 0) {
                materialEstudioDisplay.innerHTML = `<ul class="material-list">${data.map(m => `<li><span>${m[config.columnaTitulo]}</span><a href="${m[config.columnaEnlace]}" target="_blank">Ver</a></li>`).join('')}</ul>`;
            } else {
                materialEstudioDisplay.innerHTML = `<p class="mensaje-vacio">No hay material de estudio para este curso.</p>`;
            }
        } catch (err) {
            materialEstudioDisplay.innerHTML = `<p class="mensaje-vacio">Error al cargar el material.</p>`;
        }
    }
    
   async function cargarCompaneros(identificador, nombreCompleto, idUsuario) {
    companerosDisplay.innerHTML = `<p class="mensaje-vacio">Cargando compañeros...</p>`;
    const config = configuracionCursos[identificador]?.companeros;
    if (!config) {
        companerosDisplay.innerHTML = `<p class="mensaje-vacio">Configuración de 'Compañeros' no encontrada.</p>`;
        return;
    }

    try {
        // --- CONSULTA ÚNICA Y SIMPLIFICADA ---
        // Vamos directamente a la tabla del curso (ej: 'recreacion_con_proposito')
        // y pedimos toda la información que necesitamos.
        const { data: todosLosInscritos, error } = await supabaseClient
            .from(config.tabla)
            .select('nombre_completo, nombre_usuario, correo, estudiante_id') // Pedimos los datos del compañero y su ID
            .eq(config.columnaCurso, nombreCompleto); // Filtramos por el curso correcto

        if (error) throw error;

        // Ahora, filtramos la lista en JavaScript para quitar al usuario actual.
        // Usamos la columna 'estudiante_id' de tu tabla.
        const companeros = todosLosInscritos.filter(estudiante => estudiante.estudiante_id !== idUsuario);

        if (companeros.length === 0) {
            companerosDisplay.innerHTML = `<p class="mensaje-vacio">Aún no tienes compañeros en este curso.</p>`;
            return;
        }

        // Creamos la tabla directamente con los datos obtenidos.
        companerosDisplay.innerHTML = `
            <table class="calificaciones-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${companeros.map(e => `
                        <tr>
                            <td>${e.nombre_completo || 'N/A'}</td>
                            <td>${e.nombre_usuario || 'N/A'}</td>
                            <td>${e.correo || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;

    } catch (err) {
        console.error("Error al cargar compañeros:", err);
        companerosDisplay.innerHTML = `<p class="mensaje-vacio">Error al cargar compañeros.</p>`;
    }
}

    async function cargarExamenes(nombreCompleto) {
        examenesDisplay.innerHTML = `<p class="mensaje-vacio">Buscando exámenes...</p>`;
        try {
            const { data, error } = await supabaseClient
                .from('evaluaciones_maestro')
                .select('titulo, enlace')
                .eq('curso_nombre', nombreCompleto);
            if (error) throw error;
            if (data && data.length > 0) {
                examenesDisplay.innerHTML = `
                    <ul class="material-list">
                        ${data.map(examen => `
                            <li>
                                <span>${examen.titulo}</span>
                                <a href="${examen.enlace}" target="_blank">Ir al Examen</a>
                            </li>
                        `).join('')}
                    </ul>`;
            } else {
                examenesDisplay.innerHTML = `<p class="mensaje-vacio">No hay exámenes disponibles para este curso.</p>`;
            }
        } catch (err) {
            console.error("Error al cargar exámenes:", err);
            examenesDisplay.innerHTML = `<p class="mensaje-vacio">Error al cargar los exámenes: ${err.message}</p>`;
        }
    }

   async function cargarCalificaciones(nombreCompleto, usuario) {
    // 1. Muestra un mensaje de carga inicial
    calificacionesDisplay.innerHTML = `<p class="mensaje-vacio">Buscando tus calificaciones...</p>`;

    try {
        // 2. Realiza la consulta a la tabla 'calificaciones'
        const { data, error } = await supabaseClient
            .from('calificaciones') // El nombre de tu tabla de calificaciones
            .select('titulo_trabajo, nombre_completo_estudiante, nota, estado,  retroalimentacion, fecha_actualizacion') // Las columnas que quieres mostrar
            .eq('curso_nombre', nombreCompleto) // Filtra por el nombre del curso
            .eq('nombre_usuario', usuario); // Filtra por el usuario actual

        // 3. Maneja cualquier error de la consulta
        if (error) throw error;

        // 4. Revisa si se encontraron calificaciones
        if (data && data.length > 0) {
            // Si hay datos, genera el HTML para la tabla de calificaciones
            calificacionesDisplay.innerHTML = `
                <table class="calificaciones-table">
                    <thead>
                        <tr>
                            <th>Evaluación</th>
                            <th>Nombre</th>
                            <th>Nota</th>
                            <th>Estado</th>
                            <th>Retroalimentación</th>
                            <th>Fecha de actualización</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(calif => `
                            <tr>
                                <td>${calif.titulo_trabajo || 'N/A'}</td>
                                <td>${calif.nombre_completo_estudiante ?? 'Sin calificar'}</td>
                                 <td>${calif.nota ?? 'Sin calificar'}</td>
                                 <td>${calif.estado || ''}</td>
                                <td>${calif.retroalimentacion || ''}</td>
                                <td>${calif.fecha_actualizacion || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
        } else {
            // Si no se encontraron datos, muestra un mensaje amigable
            calificacionesDisplay.innerHTML = `<p class="mensaje-vacio">Aún no tienes calificaciones para este curso.</p>`;
        }
    } catch (err) {
        // 5. Si ocurre cualquier error en el proceso, lo muestra aquí
        console.error("Error al cargar calificaciones:", err);
        calificacionesDisplay.innerHTML = `<p class="mensaje-vacio">Error al cargar tus calificaciones: ${err.message}</p>`;
    }
}
    function setupLoginAndNavigation() {
        // --- Lógica de Navegación del Campus ---
        const navButtons = document.querySelectorAll('.campus-nav button');
        const sections = document.querySelectorAll('.campus-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 1. Quita la clase 'active' de todos los botones y secciones
                navButtons.forEach(btn => btn.classList.remove('active'));
                sections.forEach(sec => sec.classList.remove('active'));

                // 2. Agrega la clase 'active' solo al botón presionado y a su sección
                button.classList.add('active');
                const targetSectionId = button.dataset.section;
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }

                // 3. Carga el contenido para la nueva sección activa
                loadContentForActiveSection();
            });
        });

        // --- Lógica del Menú de Usuario ---
        const loginBoton = document.getElementById('loginboton');
        const userMenu = document.getElementById('userMenu');
        const logoutBtn = document.getElementById('logoutBtn');

        loginBoton.textContent = localStorage.getItem("loggedUser") || "Iniciar Sesión";

        loginBoton.addEventListener('click', () => {
            userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
        });

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem("loggedUser");
            window.location.href = "login.html";
        });

        // Cierra el menú si se hace clic fuera
        window.addEventListener('click', (event) => {
            if (!loginBoton.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.style.display = 'none';
            }
        });
    }
});