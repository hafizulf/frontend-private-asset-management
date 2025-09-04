import auth from "@/assets/javascript/auth";
import http from "@/assets/javascript/http";

export async function initLoginPage() {
  // Kalau sudah login, jangan boleh akses login -> lempar ke next atau /
  if (await auth.isLoggedIn()) {
    const p = new URLSearchParams(location.search);
    location.replace(p.get("next") || "/");
    return;
  }

  const form = document.getElementById("login-form") as HTMLFormElement;
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelectorAll(".error").forEach((el) => (el.textContent = ""));

    const email = (document.getElementById("email") as HTMLInputElement).value.trim();
    const password = (document.getElementById("password") as HTMLInputElement).value.trim();

    try {
      const { data } = await http.post("/auths/login", { email, password });
      localStorage.setItem("token", data.data.token);

      const p = new URLSearchParams(location.search);
      location.replace(p.get("next") || "/");
    } catch (err: any) {
      const res = err?.response;
      if (res?.status === 422 && res.data?.errors) {
        Object.entries(res.data.errors).forEach(([field, msgs]) => {
          const span = document.getElementById(`${field}-error`);
          if (span) span.textContent = (msgs as string[]).join(", ");
        });
      } else if (res?.status === 401 || res?.status === 404) {
        document.getElementById("password-error")!.textContent = "Invalid email or password";
      } else {
        console.error(err);
        alert("Login failed. Please try again.");
      }
    }
  });
}
