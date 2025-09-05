document.addEventListener('DOMContentLoaded', async () => { 
  const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co"; 
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk"; 
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const nombreMaestroSpan = document.getElementById('nombre-docente');
  const loggedUser = localStorage.getItem("loggedUser");

  if (!loggedUser) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
    return;
  }

  const { data: usuarios, error } = await supabaseClient
    .from('usuarios')
    .select('id, usuario, rol')
    .eq('usuario', loggedUser)
    .single();

  if (error || !usuarios) {
    alert("Error verificando el usuario.");
    window.location.href = "login.html";
    return;
  }

  if (usuarios.rol.toLowerCase() !== "maestro") {
    alert("Debes iniciar sesión como maestro.");
    window.location.href = "login.html";
    return;
  }

  nombreMaestroSpan.textContent = usuarios.usuario;

  const cursosGrid = document.getElementById('cursos-grid');
  const estudiantesGrid = document.getElementById('estudiantes-grid');
  const evaluacionesGrid = document.getElementById('evaluaciones-grid');

  const cursosMensaje = document.getElementById('cursos-mensaje');
  const estudiantesMensaje = document.getElementById('estudiantes-mensaje');
  const evaluacionesMensaje = document.getElementById('evaluaciones-mensaje');

  const btnCursos = document.getElementById('btn-cursos');
  const btnEstudiantes = document.getElementById('btn-estudiantes');
  const btnEvaluaciones = document.getElementById('btn-evaluaciones');

  const cursosSection = document.getElementById('cursos-docente-section');
  const estudiantesSection = document.getElementById('estudiantes-section');
  const evaluacionesSection = document.getElementById('evaluaciones-section');

  // --- Tabs ---
  btnCursos.addEventListener('click', () => {
    cursosSection.classList.add('active');
    estudiantesSection.classList.remove('active');
    evaluacionesSection.classList.remove('active');
    btnCursos.classList.add('active');
    btnEstudiantes.classList.remove('active');
    btnEvaluaciones.classList.remove('active');
  });

  btnEstudiantes.addEventListener('click', () => {
    estudiantesSection.classList.add('active');
    cursosSection.classList.remove('active');
    evaluacionesSection.classList.remove('active');
    btnEstudiantes.classList.add('active');
    btnCursos.classList.remove('active');
    btnEvaluaciones.classList.remove('active');
  });

  btnEvaluaciones.addEventListener('click', () => {
    evaluacionesSection.classList.add('active');
    cursosSection.classList.remove('active');
    estudiantesSection.classList.remove('active');
    btnEvaluaciones.classList.add('active');
    btnCursos.classList.remove('active');
    btnEstudiantes.classList.remove('active');
  });

  // --- Función principal ---
  async function cargarDatosMaestro() {
    try {
      // --- CURSOS ---
      const { data: cursos, error: errorCursos } = await supabaseClient
        .from('clases_maestro')
        .select('id, materia')
        .eq('id_maestro', usuarios.id);

      if (!cursos || cursos.length === 0) {
        cursosMensaje.textContent = "No tienes cursos asignados.";
        return;
      }

      // Mostrar cursos como botones
      cursosGrid.innerHTML = cursos.map(c => `
        <button class="curso-btn" data-curso="${c.materia}">${c.materia}</button>
      `).join('');

      // Seleccionar primer curso automáticamente
      let cursoSeleccionado = cursos[0].materia;
      cargarEstudiantes(cursoSeleccionado);
      cargarEvaluaciones(cursoSeleccionado);

      // Evento para cada botón de curso
      document.querySelectorAll('.curso-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          cursoSeleccionado = btn.dataset.curso;
          cargarEstudiantes(cursoSeleccionado);
          cargarEvaluaciones(cursoSeleccionado);
        });
      });

    } catch (err) {
      console.error("Error cargando datos del maestro:", err);
      cursosMensaje.textContent = "Error al cargar cursos.";
      estudiantesMensaje.textContent = "Error al cargar estudiantes.";
      evaluacionesMensaje.textContent = "Error al cargar evaluaciones.";
    }
  }

  // --- Cargar estudiantes por curso ---
  async function cargarEstudiantes(curso) {
    try {
      const { data: estudiantes, error } = await supabaseClient
        .from('recreacion_con_propocito')
        .select('*')
        .eq('curso', curso); // Filtramos por curso

      if (!estudiantes || estudiantes.length === 0) {
        estudiantesMensaje.textContent = `No hay estudiantes inscritos en ${curso}.`;
        estudiantesGrid.innerHTML = '';
        return;
      }

      estudiantesMensaje.textContent = '';
      estudiantesGrid.innerHTML = `
        <table class="calificaciones-table">
          <thead>
            <tr><th>Nombre Completo</th><th>Usuario</th><th>Email</th><th>Fecha Inicio</th></tr>
          </thead>
          <tbody>
            ${estudiantes.map(e => `
              <tr>
                <td>${e.nombre_completo}</td>
                <td>${e.nombre_usuario}</td>
                <td>${e.correo}</td>
                <td>${e.fecha_inicio}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
      estudiantesMensaje.textContent = "Error al cargar estudiantes.";
    }
  }

  // --- Cargar evaluaciones por curso ---
  async function cargarEvaluaciones(curso) {
    try {
      const { data: evaluaciones } = await supabaseClient
        .from('evaluaciones')
        .select('*')
        .eq('maestro_id', usuarios.id)
        .eq('curso', curso); // Filtramos por curso

      if (!evaluaciones || evaluaciones.length === 0) {
        evaluacionesMensaje.textContent = `No hay evaluaciones registradas para ${curso}.`;
        evaluacionesGrid.innerHTML = '';
        return;
      }

      evaluacionesMensaje.textContent = '';
      evaluacionesGrid.innerHTML = `
        <table class="calificaciones-table">
          <thead>
            <tr><th>Curso</th><th>Estudiante</th><th>Nota</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            ${evaluaciones.map(ev => `
              <tr>
                <td>${ev.curso}</td>
                <td>${ev.estudiante}</td>
                <td>${ev.nota}/100</td>
                <td>${ev.fecha}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (err) {
      console.error("Error cargando evaluaciones:", err);
      evaluacionesMensaje.textContent = "Error al cargar evaluaciones.";
    }
  }

  cargarDatosMaestro();
});
