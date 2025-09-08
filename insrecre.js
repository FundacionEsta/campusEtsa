// --- Conexión a Supabase (sin cambios) ---
const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const loggedUser = localStorage.getItem("loggedUser");

// --- Referencias a elementos del DOM ---
const nombreUsuarioInput = document.getElementById("nombreUsuario");
const correoInput = document.getElementById("correo");
const cedulaInput = document.getElementById("cedula");
const confirmarCedulaInput = document.getElementById("confirmarCedula"); // <-- NUEVO: referencia al campo de confirmación
const nombreCompletoInput = document.getElementById("nombreCompleto");
const formInscripcion = document.getElementById("formInscripcion");
const submitBtn = document.querySelector("button[type='submit']");

// --- Llenar automáticamente el nombre de usuario (sin cambios) ---
if (loggedUser) {
  nombreUsuarioInput.value = loggedUser;
} else {
  alert("Debes iniciar sesión para inscribirte");
  window.location.href = "login.html";
}

// --- NUEVO: Función para cifrar (hashear) datos con SHA-256 ---
// Esta función toma un texto y devuelve su hash en formato hexadecimal.
async function hashData(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convertir buffer a array de bytes
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convertir bytes a hexadecimal
  return hashHex;
}

// --- Guardar inscripción en Supabase (lógica principal modificada) ---
if (formInscripcion) {
  formInscripcion.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Procesando...';

    const nombreCompleto = nombreCompletoInput.value.trim();
    const nombreUsuario = nombreUsuarioInput.value.trim();
    const correo = correoInput.value.trim();
    const cedula = cedulaInput.value.trim();
    const confirmarCedula = confirmarCedulaInput.value.trim();

    // --- Validation Block (No changes needed here) ---
    if (!nombreCompleto || !nombreUsuario || !correo || !cedula) {
      alert("Por favor completa todos los campos.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Inscribirme ahora';
      return;
    }
    
    if (cedula !== confirmarCedula) {
      alert("Los números de cédula no coinciden. Por favor, verifica.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Inscribirme ahora';
      return;
    }
    
    try {
      // 1. Look for the user ID
      const { data: userData, error: userError } = await supabaseClient
        .from('usuarios')
        .select('id')
        .eq('usuario', nombreUsuario)
        .single();

      // Check for user ID retrieval error
      if (userError) {
        // If the user is not found, the error code will be "PGRST116" or similar
        // A simpler check is to see if userData is null
        if (!userData) {
          throw new Error("El nombre de usuario no se encontró. Por favor, inicia sesión de nuevo.");
        }
        throw userError; // Re-throw other types of user retrieval errors
      }
      
      const estudianteId = userData.id;

      // 2. Save the enrollment
      const { data: inscripcionData, error: inscripcionError } = await supabaseClient
        .from("recreacion_con_proposito")
        .insert([
          {
            nombre_completo: nombreCompleto,
            nombre_usuario: nombreUsuario,
            correo: correo,
            estudiante_id: estudianteId,
            cedula_id: cedula, 
            curso_nombre: "recreacion_con_proposito"
          }
        ]);

      // Check for enrollment insertion error
      if (inscripcionError) {
        // This is a common pattern for "already exists" errors (e.g., unique constraint violation)
        if (inscripcionError.code === "23505") { // PostgreSQL unique violation error code
            throw new Error("Ya estás inscrito en este curso.");
        }
        throw inscripcionError; // Re-throw other insertion errors
      }

      alert("¡Inscripción guardada correctamente!");
      
      // 3. Send confirmation email
      await enviarCorreo(nombreCompleto, correo);
      
      // 4. Redirect
      window.location.href = "recreacion.html";

    } catch (err) {
      console.error("Error:", err);
      // Display the specific error message to the user
      alert(err.message || "Ocurrió un error inesperado. Por favor, intenta de nuevo.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Inscribirme ahora';
    }
  });
}