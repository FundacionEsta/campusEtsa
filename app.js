// Conectar con Supabase
const SUPABASE_URL = "https://qlsuiwxlrsqgumjbuozk.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc3Vpd3hscnNxZ3VtamJ1b3prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDIzMDEsImV4cCI6MjA3MTQxODMwMX0.xSnFcsfXGt1SRUee87sprQepocXC7baag1Sc2uhOkQk"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Hasheo con SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ========= REGISTRO =========
// 🚫 Solo registra estudiantes
document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const usuario = document.getElementById("usuario").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;

  if (password !== password2) {
    alert("❌ Las contraseñas no coinciden");
    return;
  }

  const passwordHash = await hashPassword(password);

  const { error } = await supabaseClient
    .from("usuarios")
    .insert([{ 
      usuario, 
      email, 
      password: passwordHash, 
      rol: "estudiante" // 👈 siempre estudiante por defecto
    }]);

  if (error) {
    alert("❌ Error en el registro: " + error.message);
  } else {
    alert("✅ Estudiante registrado con éxito");
    document.getElementById("registroForm").reset();
  }
});

// ========= LOGIN =========
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginUsuario = document.getElementById("loginUsuario").value.trim();
  const loginPassword = document.getElementById("loginPassword").value;

  const passwordHash = await hashPassword(loginPassword);

  // Buscar por usuario O email
  const { data, error } = await supabaseClient
    .from("usuarios")
    .select("*")
    .or(`usuario.eq.${loginUsuario},email.eq.${loginUsuario}`)
    .eq("password", passwordHash)
    .single();

  if (error || !data) {
    alert("❌ Usuario o contraseña incorrectos");
  } else {
    alert("✅ Bienvenido " + data.usuario + " (" + data.rol + ")");
    localStorage.setItem("loggedUser", data.usuario);
    localStorage.setItem("userRole", data.rol);

    // Redirigir según rol
    if (data.rol === "maestro") {
      window.location.href = "campusdocente.html"; // 👈 página exclusiva de maestros
    } else {
      window.location.href = "index.html"; // 👈 página de estudiantes
    }
  }
});
