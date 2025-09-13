       
   document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk";
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- MAPA DE CONFIGURACIÓN DE CURSOS ---
    const courseConfig = {
        "recreacion_con_proposito": {
            studentsTable: "recreacion_con_proposito",
            classVirtualTable: "clase_virtual_recreacion_con_proposito",
            studyMaterialTable: "material_estudio_recreacion_con_proposito"
        },
        "IA PARA NO PROGRAMADORES": {
            studentsTable: "ia_no_programadores",
            classVirtualTable: "clase_virtual_ia_no_programadores",
            studyMaterialTable: "material_estudio_ia_no_programadores"
        }
    };

    const nombreMaestroSpan = document.getElementById('nombre-docente');
    const loggedUser = localStorage.getItem("loggedUser");
    let usuarioData = null;
    let selectedCourse = null;

    const sections = {};
    document.querySelectorAll('.campus-section').forEach(section => {
        sections[section.id] = section;
    });

    function showCustomModal(message, callback) {
        const modal = document.getElementById('customModal');
        document.getElementById('modalMessage').textContent = message;
        modal.style.display = 'block';
        document.getElementById('modalCloseBtn').onclick = () => {
            modal.style.display = 'none';
            if (callback) callback();
        };
    }

    const loginBtn = document.getElementById("loginboton");
    const userMenu = document.getElementById("userMenu");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loggedUser) {
        loginBtn.textContent = "👤 " + loggedUser;
        loginBtn.onclick = () => userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
        logoutBtn.onclick = () => {
            localStorage.removeItem("loggedUser");
            showCustomModal("Sesión cerrada", () => window.location.reload());
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

    if (!loggedUser) {
        showCustomModal("Debes iniciar sesión para acceder.", () => window.location.href = "login.html");
        return;
    }

    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('id, usuario, rol')
        .eq('usuario', loggedUser)
        .single();

    if (error || !data || data.rol.toLowerCase() !== "maestro") {
        showCustomModal("Acceso denegado. Debes ser maestro.", () => window.location.href = "login.html");
        return;
    }
    usuarioData = data;
    nombreMaestroSpan.textContent = usuarioData.usuario;

    function activateSection(sectionId) {
        Object.values(sections).forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.campus-nav button').forEach(b => b.classList.remove('active'));
        
        sections[sectionId].classList.add('active');
        const activeButton = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeButton) activeButton.classList.add('active');
        
        if (selectedCourse) loadContentForActiveSection();
    }
    
    document.querySelectorAll('.campus-nav button').forEach(button => {
        button.addEventListener('click', (e) => activateSection(e.target.dataset.section));
    });

    function loadContentForActiveSection() {
        const activeSectionId = document.querySelector('.campus-section.active').id;
        switch (activeSectionId) {
            case 'estudiantes-section': cargarEstudiantes(selectedCourse); break;
            case 'evaluaciones-section': cargarEvaluaciones(selectedCourse); break;
            case 'recreacion-section': cargarRecreacion(selectedCourse); break;
            case 'proposito-section': cargarProposito(selectedCourse); break;
            case 'examenes-section': cargarExamenes(selectedCourse); break;
            case 'subir-calificaciones-section': cargarEstudiantesParaCalificar(selectedCourse); break;
        }
    }
    
    async function cargarCursos() {
        try {
            const { data: cursos, error } = await supabaseClient
                .from('maestros_materias')
                .select('materia')
                .eq('maestro_id', usuarioData.id);

            if (error) throw error;
            if (!cursos || cursos.length === 0) {
                document.getElementById('cursos-grid').innerHTML = `<p class="mensaje-vacio">No tienes cursos asignados.</p>`;
                return;
            }
            
            document.getElementById('cursos-grid').innerHTML = cursos.map(c => `<button class="curso-btn" data-curso="${c.materia}">${c.materia}</button>`).join('');
            
            document.querySelectorAll('.curso-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    selectedCourse = btn.dataset.curso;
                    document.querySelectorAll('.curso-btn').forEach(b => b.classList.remove('active-curso'));
                    btn.classList.add('active-curso');
                    loadContentForActiveSection();
                });
            });

            if (cursos.length > 0) {
                document.querySelector('.curso-btn').click();
            }
        } catch (err) {
            showCustomModal(`Error al cargar tus cursos: ${err.message}`);
        }
    }

    async function cargarEstudiantes(curso) {
        const grid = document.getElementById('estudiantes-grid');
        grid.innerHTML = `<p class="mensaje-vacio">Cargando estudiantes...</p>`;
        
        const config = courseConfig[curso];
        if (!config || !config.studentsTable) {
            grid.innerHTML = `<p class="mensaje-vacio">Configuración no encontrada para el curso: ${curso}.</p>`;
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from(config.studentsTable)
                .select('nombre_completo, nombre_usuario, correo, fecha_inicio')
                .eq('curso_nombre', curso);

            if (error) throw error;
            if (!data || data.length === 0) {
                grid.innerHTML = `<p class="mensaje-vacio">No hay estudiantes inscritos en este curso.</p>`;
                return;
            }
            grid.innerHTML = `
                <table class="calificaciones-table">
                    <thead><tr><th>Nombre Completo</th><th>Usuario</th><th>Email</th><th>Fecha Inicio</th></tr></thead>
                    <tbody>${data.map(e => `
                        <tr>
                            <td>${e.nombre_completo || 'N/A'}</td>
                            <td>${e.nombre_usuario || 'N/A'}</td>
                            <td>${e.correo || 'N/A'}</td>
                            <td>${e.fecha_inicio || 'N/A'}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;
        } catch (err) {
            grid.innerHTML = `<p class="mensaje-vacio">Error al cargar estudiantes: ${err.message}</p>`;
        }
    }
    
    async function cargarEstudiantesParaCalificar(curso) {
        const select = document.getElementById('calificacion-estudiante-select');
        select.innerHTML = '<option value="">Cargando estudiantes...</option>';
        
        const config = courseConfig[curso];
        if (!config || !config.studentsTable) {
            select.innerHTML = `<option value="">Configuración no encontrada para el curso.</option>`;
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from(config.studentsTable)
                .select('estudiante_id, nombre_usuario, nombre_completo')
                .eq('curso_nombre', curso);

            if (error) throw error;
            if (!data || data.length === 0) {
                select.innerHTML = '<option value="">No hay estudiantes en este curso</option>';
                return;
            }
            select.innerHTML = '<option value="">Selecciona un estudiante...</option>';
            data.forEach(estudiante => {
                if (!estudiante.estudiante_id) return;
                
                const option = document.createElement('option');
                option.value = JSON.stringify({
                    id: estudiante.estudiante_id,
                    usuario: estudiante.nombre_usuario,
                    nombre_completo: estudiante.nombre_completo
                });
                option.textContent = `${estudiante.nombre_completo} (${estudiante.nombre_usuario})`;
                select.appendChild(option);
            });
        } catch (err) {
            select.innerHTML = `<option value="">Error: ${err.message}</option>`;
        }
    }
    
    async function cargarEvaluaciones(curso) {
        const grid = document.getElementById('evaluaciones-grid');
        grid.innerHTML = `<p class="mensaje-vacio">Cargando calificaciones...</p>`;
        try {
            const { data, error } = await supabaseClient
                .from('calificaciones')
                .select('*')
                .eq('curso_nombre', curso);
            if (error) throw error;
            if (!data || data.length === 0) {
                grid.innerHTML = `<p class="mensaje-vacio">No hay calificaciones registradas en este curso.</p>`;
                return;
            }
            grid.innerHTML = `
                <table class="calificaciones-table">
                    <thead><tr><th>Estudiante</th><th>Evaluación</th><th>Retroalimentacion</th><th>Nota</th><th>Estado</th><th>Fecha de subida</th></tr></thead>
                    <tbody>${data.map(cal => `
                        <tr>
                            <td>${cal.nombre_completo_estudiante || cal.nombre_usuario}</td>
                            <td>${cal.evaluacion_titulo}</td>
                            <td>${cal.retroalimentacion}</td>
                            <td>${cal.nota}</td>
                            <td>${cal.estado}</td>
                            <td>${new Date(cal.fecha_actualizacion).toLocaleDateString()}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;
        } catch (err) {
            grid.innerHTML = `<p class="mensaje-vacio">Error al cargar calificaciones.</p>`;
        }
    }

    async function simpleLoadAndRender(curso, { fromTable, displayElement, renderFn }) {
        displayElement.innerHTML = `<p class="mensaje-vacio">Cargando...</p>`;
        try {
            const { data, error } = await supabaseClient.from(fromTable).select('*').eq('curso_nombre', curso);
            if (error) throw error;
            displayElement.innerHTML = renderFn(data);
        } catch (err) {
            displayElement.innerHTML = `<p class="mensaje-vacio">Error al cargar datos.</p>`;
        }
    }
    
    // =================================================================================
    // FUNCIÓN 'simpleUpload' CORREGIDA
    // =================================================================================
    // AÑADIMOS 'onConflictCols' PARA ESPECIFICAR LAS COLUMNAS ÚNICAS
    async function simpleUpload(curso, { fromTable, payload, inputsToClear, successCallback, onConflictCols }) {
        if (!curso) {
            showCustomModal("Por favor, selecciona un curso primero.");
            return;
        }
        try {
            // CAMBIO CLAVE: Añadimos el segundo parámetro a .upsert()
            const { error } = await supabaseClient
                .from(fromTable)
                .upsert(payload, {
                    onConflict: onConflictCols // Aquí le decimos qué columnas no se pueden repetir
                });

            if (error) throw error;

            showCustomModal("Información guardada exitosamente.", () => {
                inputsToClear.forEach(input => input.value = '');
                if(successCallback) successCallback(curso);
            });
        } catch (err) {
            showCustomModal(`Error al guardar: ${err.message}`);
        }
    }

    const cargarRecreacion = (curso) => {
        const config = courseConfig[curso];
        if (!config) return;
        simpleLoadAndRender(curso, {
            fromTable: config.classVirtualTable,
            displayElement: document.getElementById('recreacion-display'),
            renderFn: (data) => !data || data.length === 0 ? `<p class="mensaje-vacio">No hay enlace de clase virtual.</p>` : `<ul class="material-list">${data.map(item => `<li><span>Enlace actual</span><a href="${item.enlace}" target="_blank">${item.enlace}</a></li>`).join('')}</ul>`
        });
    };

    const cargarProposito = (curso) => {
        const config = courseConfig[curso];
        if (!config) return;
        simpleLoadAndRender(curso, {
            fromTable: config.studyMaterialTable,
            displayElement: document.getElementById('proposito-display'),
            renderFn: (data) => !data || data.length === 0 ? `<p class="mensaje-vacio">No hay material de estudio.</p>` : `<ul class="material-list">${data.map(item => `<li><span>${item.titulo}</span><a href="${item.enlace}" target="_blank">Ver</a></li>`).join('')}</ul>`
        });
    };

    const cargarExamenes = (curso) => simpleLoadAndRender(curso, {
        fromTable: 'evaluaciones_maestro',
        displayElement: document.getElementById('examenes-display'),
        renderFn: (data) => !data || data.length === 0 ? `<p class="mensaje-vacio">No hay exámenes subidos.</p>` : `<ul class="material-list">${data.map(item => `<li><span>${item.titulo}</span><a href="${item.enlace}" target="_blank">Ir al examen</a></li>`).join('')}</ul>`
    });

    // =================================================================================
    // BOTÓN 'subirRecreacionBtn' CORREGIDO
    // =================================================================================
    document.getElementById('subirRecreacionBtn').addEventListener('click', () => {
        const urlInput = document.getElementById('recreacion-url-input');
        const config = courseConfig[selectedCourse];
        if (!config) return showCustomModal("Configuración del curso no encontrada.");
        if (!urlInput.value) return showCustomModal("El campo de URL no puede estar vacío.");
        
        simpleUpload(selectedCourse, {
            fromTable: config.classVirtualTable,
            payload: { curso_nombre: selectedCourse, enlace: urlInput.value, maestro_id: usuarioData.id },
            inputsToClear: [urlInput],
            successCallback: cargarRecreacion,
            // CAMBIO CLAVE: Le decimos a la función qué columnas deben ser únicas
            onConflictCols: 'maestro_id, curso_nombre'
        });
    });

    document.getElementById('subirPropositoBtn').addEventListener('click', () => {
        const tituloInput = document.getElementById('proposito-titulo-input');
        const urlInput = document.getElementById('proposito-url-input');
        const config = courseConfig[selectedCourse];
        if (!config) return showCustomModal("Configuración del curso no encontrada.");
        if (!tituloInput.value || !urlInput.value) return showCustomModal("Todos los campos son obligatorios.");
        simpleUpload(selectedCourse, {
            fromTable: config.studyMaterialTable,
            payload: { curso_nombre: selectedCourse, titulo: tituloInput.value, enlace: urlInput.value, maestro_id: usuarioData.id },
            inputsToClear: [tituloInput, urlInput],
            successCallback: cargarProposito,
            // AÑADIDO: Suponiendo que el material también debe ser único
            onConflictCols: 'maestro_id, curso_nombre, titulo'
        });
    });

    document.getElementById('subirExamenBtn').addEventListener('click', () => {
        const tituloInput = document.getElementById('examen-titulo-input');
        const urlInput = document.getElementById('examen-url-input');
        if (!tituloInput.value || !urlInput.value) return showCustomModal("Todos los campos son obligatorios.");
        simpleUpload(selectedCourse, {
            fromTable: 'evaluaciones_maestro',
            payload: { curso_nombre: selectedCourse, titulo: tituloInput.value, enlace: urlInput.value, maestro_id: usuarioData.id },
            inputsToClear: [tituloInput, urlInput],
            successCallback: cargarExamenes,
            // AÑADIDO: Suponiendo que los exámenes también deben ser únicos
            onConflictCols: 'maestro_id, curso_nombre, titulo'
        });
    });

    document.getElementById('subirCalificacionBtn').addEventListener('click', async () => {
        const estudianteSelect = document.getElementById('calificacion-estudiante-select');
        const trabajoInput = document.getElementById('calificacion-trabajo-input');
        const notaInput = document.getElementById('calificacion-nota-input');
        const retroalimentacionInput = document.getElementById('calificacion-retroalimentacion-input');
        const estadoInput = document.getElementById('calificacion-estado-input');

        if (!estudianteSelect.value || !trabajoInput.value || !notaInput.value || !retroalimentacionInput.value || !estadoInput.value) {
            return showCustomModal("Todos los campos son obligatorios para subir una calificación.");
        }
        
        const estudianteSeleccionado = JSON.parse(estudianteSelect.value);

        try {
            // Nota: Para calificaciones, es más común usar .insert() ya que cada una es un registro nuevo.
            // Si necesitaras actualizar una calificación existente, también usarías .upsert() aquí.
            const { error } = await supabaseClient.from('calificaciones').insert({
                curso_nombre: selectedCourse,
                estudiante_id: estudianteSeleccionado.id,
                fecha_actualizacion: new Date().toISOString(),
                estado: estadoInput.value,
                nombre_usuario: estudianteSeleccionado.usuario,
                nombre_completo_estudiante: estudianteSeleccionado.nombre_completo,
                evaluacion_titulo: trabajoInput.value,
                retroalimentacion: retroalimentacionInput.value,
                nota: notaInput.value
            });
            if (error) throw error;
            showCustomModal("Calificación subida exitosamente.", () => {
                trabajoInput.value = '';
                notaInput.value = '';
                retroalimentacionInput.value = '';
                estadoInput.value = '';
                estudianteSelect.value = '';
                if (document.getElementById('evaluaciones-section').classList.contains('active')) {
                    cargarEvaluaciones(selectedCourse);
                }
            });
        } catch (err) {
            showCustomModal(`Error al subir la calificación: ${err.message}`);
        }
    });

    cargarCursos();
});