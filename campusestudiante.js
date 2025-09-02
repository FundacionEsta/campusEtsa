document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. CONFIGURACIÓN INICIAL ---
    const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk";
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- MAPA DE CONFIGURACIÓN DE CURSOS ---
    const configuracionCursos = {
        "IA para no programadores": {
            claseVirtual: { tabla: "clase_virtual_ia_no_programadores", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            materialEstudio: { tabla: "material_estudio_ia_no_programadores", columnaTitulo: "titulo", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            companeros: { tabla: "ia_no_programadores", columnaEstudianteId: "estudiante_id", columnaCurso: "curso_nombre" }
        },
        "Recreación con propósito": {
            claseVirtual: { tabla: "clase_virtual_recreacion_con_proposito", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            materialEstudio: { tabla: "material_estudio_recreacion_con_proposito", columnaTitulo: "titulo", columnaEnlace: "enlace", columnaCurso: "curso_nombre" },
            companeros: { tabla: "recreacion_con_proposito", columnaEstudianteId: "estudiante_id", columnaCurso: "curso_nombre" }
        }
    };

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const nombreEstudianteSpan = document.getElementById('nombre-estudiante');
    const cursosGrid = document.getElementById('cursos-grid');
    const claseVirtualDisplay = document.getElementById('clase-virtual-display');
    const materialEstudioDisplay = document.getElementById('material-estudio-display');
    const examenesDisplay = document.getElementById('examenes-display');
    const calificacionesDisplay = document.getElementById('calificaciones-display');
    const companerosDisplay = document.getElementById('companeros-display');
    const loggedUser = localStorage.getItem("loggedUser");
    let userId = null;
    let selectedCourse = null;

    // --- LÓGICA PRINCIPAL DE INICIO ---
    // Esta función auto-ejecutable organiza todo el proceso de inicio.
    (async function init() {
        if (!loggedUser) {
            alert("No se encontró usuario. Redirigiendo al login.");
            window.location.href = "login.html";
            return;
        }

        // Configura los botones de login/logout
        setupLoginButton();
        
        try {
            // Obtiene el ID del usuario y luego carga sus cursos
            await fetchUserDataAndLoadCourses();
        } catch (err) {
            console.error("Error crítico al iniciar:", err);
            cursosGrid.innerHTML = `<div style="background-color:#ffebee; color:#c62828; padding:20px; border-radius:10px;"><h4>Error al verificar usuario</h4><p>${err.message}</p></div>`;
        }
    })();


    // --- DEFINICIÓN DE FUNCIONES ---

    async function fetchUserDataAndLoadCourses() {
        const { data: usuarioData, error: usuarioError } = await supabaseClient
            .from('usuarios')
            .select('id, usuario, rol') // Usamos 'id' porque así se llama la columna
            .eq('usuario', loggedUser)
            .single();

        if (usuarioError) throw usuarioError;

        if (!usuarioData || usuarioData.rol.toLowerCase() !== "estudiante") {
            alert("Acceso denegado. Debes ser un estudiante registrado.");
            window.location.href = "login.html";
            return;
        }

        nombreEstudianteSpan.textContent = usuarioData.usuario;
        userId = usuarioData.id; // Guardamos el 'id' (que es el uuid)

        // Llamamos a cargar los cursos DESPUÉS de tener el userId
        await cargarCursos();
    }
    
    async function cargarCursos() {
        try {
            const consultaIA = supabaseClient.from('ia_no_programadores').select('curso_nombre').eq('estudiante_id', userId);
            const consultaRecreacion = supabaseClient.from('recreacion_con_proposito').select('curso_nombre').eq('estudiante_id', userId);
            const [resIA, resRecreacion] = await Promise.all([consultaIA, consultaRecreacion]);

            if (resIA.error) throw resIA.error;
            if (resRecreacion.error) throw resRecreacion.error;

            const cursos = [...(resIA.data || []), ...(resRecreacion.data || [])];
            const cursosUnicos = Array.from(new Set(cursos.map(c => c.curso_nombre))).map(nombre => ({ curso_nombre: nombre }));

            if (cursosUnicos.length === 0) {
                cursosGrid.innerHTML = `<p class="mensaje-vacio">No estás inscrito en ningún curso.</p>`;
                return;
            }
            
            renderizarCursos(cursosUnicos);
            const primerCursoBtn = cursosGrid.querySelector('.curso-btn');
            if (primerCursoBtn) primerCursoBtn.click();

        } catch (err) {
            console.error("Error al cargar cursos:", err);
            cursosGrid.innerHTML = `<div style="background-color:#ffebee; border:1px solid #c62828; color:#c62828; padding:20px; border-radius:10px; text-align:left;"><h4 style="margin-top:0;">🛑 Error al Cargar Cursos</h4><p><strong>Mensaje:</strong> ${err.message}</p><p><strong>Detalles:</strong> ${err.details || 'No hay más detalles.'}</p></div>`;
        }
    }

    function renderizarCursos(cursos) {
        cursosGrid.innerHTML = cursos.map(c => `<button class="curso-btn" data-curso="${c.curso_nombre}">${c.curso_nombre}</button>`).join('');
        document.querySelectorAll('.curso-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedCourse = btn.dataset.curso;
                document.querySelectorAll('.curso-btn').forEach(b => b.classList.remove('active-curso'));
                btn.classList.add('active-curso');
                loadContentForActiveSection();
            });
        });
    }

    function loadContentForActiveSection() {
        const activeSection = document.querySelector('.campus-nav button.active');
        if (!activeSection || !selectedCourse) return;
        
        const sectionId = activeSection.dataset.section;
        switch (sectionId) {
            case 'clase-virtual-section': cargarClaseVirtual(selectedCourse); break;
            case 'material-estudio-section': cargarMaterialEstudio(selectedCourse); break;
            case 'examenes-section': cargarExamenes(selectedCourse); break;
            case 'calificaciones-section': cargarCalificaciones(selectedCourse, loggedUser); break;
            case 'companeros-section': cargarCompaneros(selectedCourse, userId); break;
        }
    }
    
    // --- Resto de funciones auxiliares ---

    async function cargarClaseVirtual(curso) {
        // ... (tu código para esta función)
    }
    async function cargarMaterialEstudio(curso) {
        // ... (tu código para esta función)
    }
    async function cargarExamenes(curso) {
        // ... (tu código para esta función)
    }
    async function cargarCalificaciones(curso, usuario) {
        // ... (tu código para esta función)
    }
    async function cargarCompaneros(curso, idUsuario) {
        // ... (tu código para esta función)
    }

    function setupLoginButton() {
        const loginBtn = document.getElementById("loginboton");
        const userMenu = document.getElementById("userMenu");
        const logoutBtn = document.getElementById("logoutBtn");

        if (loggedUser) {
            loginBtn.textContent = "👤 " + loggedUser;
            loginBtn.onclick = () => userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
            logoutBtn.onclick = () => {
                localStorage.removeItem("loggedUser");
                alert("Sesión cerrada");
                window.location.reload();
            };
        } else {
            loginBtn.textContent = "Iniciar Sesión";
            loginBtn.onclick = () => window.location.href = "login.html";
        }

        window.onclick = (event) => {
            if (!loginBtn.contains(event.target) && !userMenu.contains(event.target)) {
                userMenu.style.display = "none";
            }
        };
        
        document.querySelectorAll('.campus-nav button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.campus-nav button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.campus-section').forEach(s => s.classList.remove('active'));
                
                const sectionId = e.target.dataset.section;
                e.target.classList.add('active');
                document.getElementById(sectionId).classList.add('active');
                
                loadContentForActiveSection();
            });
        });
    }
});