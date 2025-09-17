import auth from "@/assets/javascript/auth";
import http from "@/assets/javascript/http";
import { clearErrors, applyErrors, showFieldError } from "@/helpers/form-validation";

export async function initLoginPage() {
  if (await auth.isLoggedIn()) {
    // const p = new URLSearchParams(location.search);
    // location.replace(p.get("next") || "/");

    // redirect to 404
    location.replace("/not-found");
    return;
  }

  const form = document.getElementById("login-form") as HTMLFormElement;

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearErrors(form);

    const emailEl = document.getElementById("email") as HTMLInputElement;
    const passEl  = document.getElementById("password") as HTMLInputElement;
    const email = emailEl.value.trim();
    const password = passEl.value.trim();

    try {
      const { data } = await http.post("/auths/login", { email, password });
      localStorage.setItem("token", data.data.token);
      const p = new URLSearchParams(location.search);
      location.replace(p.get("next") || "/");
    } catch (err: any) {
      const res = err?.response;

      if (res?.status === 422 && res.data?.errors) {
        applyErrors(form, res.data.errors);
      } else if (res?.status === 401 || res?.status === 404) {
        showFieldError(form, "password", "Invalid email or password");
      } else {
        console.error(err);
        alert("Login failed. Please try again.");
      }
    }
  });
}
