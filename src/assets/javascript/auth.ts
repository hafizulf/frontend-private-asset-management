const isLoggedIn = async () => {
  console.log("is logged in method , env >> ", import.meta.env.VITE_BACKEND_URL);
}

export default {
  isLoggedIn,
}