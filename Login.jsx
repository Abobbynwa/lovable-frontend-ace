import { loginUser } from "../services/auth";

const handleLogin = async () => {
  const data = await loginUser(email, password);

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    if (data.user.role === "admin") window.location.href = "/admin";
    if (data.user.role === "staff") window.location.href = "/staff";
    if (data.user.role === "student") window.location.href = "/student";
  } else {
    alert(data.message);
  }
};
export default handleLogin;