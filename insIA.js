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

    if (!nombreCompleto || !nombreUsuario || !correo) {
      alert("Por favor completa todos los campos.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Inscribirme ahora';
      return;
    }

    try {
      // Step 1: Find the user's ID in the 'usuarios' table
      const { data: userData, error: userError } = await supabaseClient
        .from('usuarios')
        .select('id')
        .eq('usuario', nombreUsuario)
        .single();

      if (userError || !userData) {
        throw new Error("No se pudo encontrar el ID del usuario.");
      }

      const estudianteId = userData.id;

      // Step 2: Insert the enrollment with the student's ID
      const { data: inscripcionData, error: inscripcionError } = await supabaseClient
        .from("ia_no_programadores")
        .insert([{
          nombre_completo: nombreCompleto,
          nombre_usuario: nombreUsuario,
          correo: correo,
          estudiante_id: estudianteId,
          curso_nombre: "IA PARA NO PROGRAMADORES"
          // This is where the ID is inserted
        }]);

      if (inscripcionError) throw inscripcionError;

      alert("¡Inscripción guardada correctamente!");

      // Step 3: Send confirmation email (ONLY if the save was successful)
      await enviarCorreo(nombreCompleto, correo);

      // Step 4: Redirect the user
      window.location.href = "IA.html";

    } catch (err) {
      console.error("Error:", err.message);
      alert("Ocurrió un error. El usuario ya podría estar registrado o hubo un problema al obtener su ID.");
      submitBtn.disabled = false;
      submitBtn.textContent = 'Inscribirme ahora';
    }
  });
}