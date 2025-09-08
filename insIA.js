async function enviarCorreo(nombreCompleto, correo) {
  try {
    const templateParams = {
      to_name: nombreCompleto,
      to_email: correo,
      message: `Hola ${nombreCompleto}, tu inscripción al curso ha sido exitosa. ¡Nos vemos pronto!`
    };

    const response = await emailjs.send(
      "service_4cgcj3m",
      "template_9arzj9v",
      templateParams
    );

    console.log("Correo enviado correctamente:", response.status, response.text);
    alert("¡Correo de confirmación enviado al usuario!");
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    alert("Hubo un problema al enviar el correo de confirmación.");
  }
}

// --- LÓGICA DE INSCRIPCIÓN ---

// Conexión con Supabase
const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Referencias a los elementos del DOM
const nombreUsuarioInput = document.getElementById("nombreUsuario");
const correoInput = document.getElementById("correo");
const cedulaInput = document.getElementById("cedula");
const confirmarCedulaInput = document.getElementById("confirmarCedula"); // <-- NUEVO: referencia al campo de confirmación
const nombreCompletoInput = document.getElementById("nombreCompleto");
const formInscripcion = document.getElementById("formInscripcion");
const submitBtn = formInscripcion.querySelector("button[type='submit']");

// Llenar datos del usuario logeado
const loggedUser = localStorage.getItem("loggedUser");
if (loggedUser) {
  nombreUsuarioInput.value = loggedUser;
  nombreUsuarioInput.readOnly = true;
} else {
  alert("Debes iniciar sesión para inscribirte");
  window.location.href = "login.html";
}

// Evento para guardar inscripción y enviar correo
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

    // --- Validación de campos (sin cambios) ---
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
      // 1. Buscar el ID del usuario
      const { data: userData, error: userError } = await supabaseClient
        .from('usuarios')
        .select('id')
        .eq('usuario', nombreUsuario)
        .single();

      if (userError || !userData) {
        // Si no se encuentra el usuario, lanza un error específico.
        throw new Error("No se pudo encontrar el usuario. Asegúrate de haber iniciado sesión correctamente.");
      }

      const estudianteId = userData.id;

      // 2. Insertar la inscripción
      const { data: inscripcionData, error: inscripcionError } = await supabaseClient
        .from("ia_no_programadores")
        .insert([{
          nombre_completo: nombreCompleto,
          nombre_usuario: nombreUsuario,
          correo: correo,
          cedula_id: cedula, 
          estudiante_id: estudianteId,
          curso_nombre: "IA PARA NO PROGRAMADORES"
        }]);

      if (inscripcionError) {
        // Manejo de error de duplicación (violación de restricción única)
        if (inscripcionError.code === "23505") {
          throw new Error("Ya estás inscrito en este curso.");
        }
        throw inscripcionError; // Relanzar otros errores de inserción
      }

      alert("¡Inscripción guardada correctamente!");

      // 3. Enviar correo de confirmación
      await enviarCorreo(nombreCompleto, correo);

      // 4. Redirigir al usuario
      window.location.href = "IA.html";

    } catch (err) {
      console.error("Error:", err);
      // Mostrar el mensaje de error específico al usuario.
      // Si el error no es del tipo 'Error', se muestra un mensaje genérico.
      alert(err.message || "Ocurrió un error inesperado. Por favor, intenta de nuevo.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Inscribirme ahora';
    }
  });
}