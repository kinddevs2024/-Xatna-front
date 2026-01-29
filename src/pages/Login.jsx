import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "@material-tailwind/react";
import { Analytics } from "@vercel/analytics/react";
import { API_BASE_URL, API_ENDPOINTS } from "../data/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    tg_username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tg_username: formData.tg_username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming the API returns { token, user } or { access_token, user }
        const authToken = data.token || data.access_token || data.accessToken;
        const userData = data.user || data;

        if (authToken) {
          login(userData, authToken);

          // Redirect based on user role
          const userRole = userData.role || userData.role_type;
          if (userRole === "SUPER_ADMIN" || userRole === "super_admin") {
            navigate("/users");
          } else if (userRole === "admin" || userData.isAdmin) {
            navigate("/admin");
          } else if (userRole === "client" || !userRole) {
            navigate("/booking");
          } else {
            navigate("/booking");
          }
        } else {
          setError("Неправильный ответ от сервера");
        }
      } else {
          setError(
            data.message ||
              "Вход не удался. Пожалуйста, проверьте свои данные."
          );
      }
    } catch (err) {
      setError(
        "Ошибка сети. Пожалуйста, проверьте подключение к интернету и попробуйте еще раз."
      );
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen bg-white">
      <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2 text-center">
                Вход
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mb-6 text-center">
                Войдите в свой аккаунт
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleFormSubmit}
                className="space-y-4 sm:space-y-5 md:space-y-6">
                <Input
                  type="text"
                  name="tg_username"
                  value={formData.tg_username}
                  onChange={handleInputChange}
                  label="Имя пользователя Telegram"
                  placeholder="@username"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  label="Пароль"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-barber-olive hover:bg-barber-gold text-white font-semibold"
                  loading={isSubmitting}>
                  {isSubmitting ? "Вход..." : "Войти"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Нет аккаунта?{" "}
                  <Link
                    to="/register"
                    className="text-barber-olive hover:text-barber-gold font-semibold">
                    Зарегистрируйтесь здесь
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <Analytics />
    </div>
  );
}

export default Login;
