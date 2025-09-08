document.addEventListener("DOMContentLoaded", () => {
  // --- 1. VERIFICACIÓN DE ROL (SEGURIDAD) ---
  const userRole = localStorage.getItem('userRole');

  if (userRole !== 'admin') {
    alert('🚫 Acceso denegado. Esta página es solo para administradores.');
    window.location.href = 'index.html';
    return;
  }
  
  // --- 2. SI ES ADMIN, CONTINUAR ---
  const loggedUser = localStorage.getItem('loggedUser');
  document.getElementById('admin-username').textContent = loggedUser || 'Admin';
  
  // Configuración de Supabase
  const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk";
  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Elementos del DOM
  const formCard = document.getElementById("form-card");
  const form = document.getElementById("formUsuario");
  const cancelBtn = document.getElementById("cancelBtn");
  const tablaUsuarios = document.getElementById("tabla-usuarios");

  // Cargar usuarios al inicio
  cargarUsuarios();

  // --- FUNCIONES PRINCIPALES ---
  async function cargarUsuarios() {
    const { data, error } = await db.from("usuarios").select("id, usuario, email, rol");
    if (error) { console.error("Error al cargar usuarios:", error); return; }

    tablaUsuarios.innerHTML = "";
    data.forEach(user => {
      const fila = document.createElement("tr");
      fila.dataset.userId = user.id;
      fila.innerHTML = `
        <td>${user.usuario}</td>
        <td>${user.email}</td>
        <td>${user.rol}</td>
        <td class="actions">
          <button class="edit-btn">✏️ Editar</button>
          <button class="delete-btn">🗑️ Eliminar</button>
        </td>`;
      tablaUsuarios.appendChild(fila);
    });
  }

  // CAMBIO: El formulario ahora solo actualiza, no crea
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await actualizarUsuario();
  });

  async function actualizarUsuario() {
    const id = document.getElementById("userId").value;
    const datosActualizados = {
      usuario: document.getElementById("usuario").value.trim(),
      email: document.getElementById("email").value.trim(),
      rol: document.getElementById("rol").value,
    };
    const { error } = await db.from("usuarios").update(datosActualizados).eq("id", id);
    if (error) { alert("❌ Error al actualizar: " + error.message); return; }
    
    alert("✅ Usuario actualizado correctamente");
    resetForm();
    await cargarUsuarios();
  }

  // CAMBIO: Esta función ahora también muestra el formulario
  function iniciarEdicion(user) {
    document.getElementById("userId").value = user.id;
    document.getElementById("usuario").value = user.usuario;
    document.getElementById("email").value = user.email;
    document.getElementById("rol").value = user.rol;
    
    formCard.style.display = 'block'; // Muestra el formulario de edición
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // CAMBIO: Esta función ahora también oculta el formulario
  function resetForm() {
    form.reset();
    formCard.style.display = 'none'; // Oculta el formulario
  }

  cancelBtn.addEventListener("click", resetForm);

  // MANEJO DE EVENTOS EN LA TABLA (EDITAR Y ELIMINAR)
  tablaUsuarios.addEventListener('click', async (e) => {
    const target = e.target;
    const fila = target.closest('tr');
    if (!fila) return;

    const userId = fila.dataset.userId;

    // Botón Editar
    if (target.classList.contains('edit-btn')) {
      const { data: user, error } = await db.from('usuarios').select('*').eq('id', userId).single();
      if (error) { console.error('Error obteniendo usuario para editar:', error); return; }
      iniciarEdicion(user);
    }

    // Botón Eliminar
    if (target.classList.contains('delete-btn')) {
      if (confirm("¿Seguro que deseas eliminar este usuario?")) {
        const { error } = await db.from("usuarios").delete().eq("id", userId);
        if (error) { alert("❌ Error al eliminar: " + error.message); return; }
        await cargarUsuarios();
      }
    }
  });
});