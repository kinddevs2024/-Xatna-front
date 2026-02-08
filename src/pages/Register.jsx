import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input } from "@material-tailwind/react";
import { Analytics } from "@vercel/analytics/react";
import { API_BASE_URL, API_ENDPOINTS } from "../data/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    tg_username: "",
    phone_number: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // Public client registration uses POST /client
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.createClient}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "*/*",
          },
          body: JSON.stringify({
            name: formData.name,
            phone_number: formData.phone_number,
            ...(formData.tg_username && {
              tg_username: formData.tg_username.replace(/^@/, ""),
            }),
          }),
        }
      );

      const data = await response.json();

      // Handle different error status codes
      if (response.status === 400) {
        setError(
          data.message ||
            data.error ||
            "Регистрация не удалась. Проверьте введенные данные."
        );
        setIsSubmitting(false);
        return;
      } else if (response.status === 401) {
        setError("Ошибка авторизации. Пожалуйста, попробуйте еще раз.");
        setIsSubmitting(false);
        return;
      } else if (response.status === 403) {
        setError("Доступ запрещен. Пожалуйста, свяжитесь с администратором.");
        setIsSubmitting(false);
        return;
      } else if (response.status === 409) {
        setError(
          data.message ||
            data.error ||
            "Пользователь с такими данными уже существует."
        );
        setIsSubmitting(false);
        return;
      } else if (response.ok || response.status === 201) {
        // API returns { token, user } - auto-login the user
        const authToken = data.token || data.access_token || data.accessToken;
        const userData = data.user || data;

        if (authToken && userData) {
          // Auto-login after successful registration
          login(userData, authToken);
          setSuccess(true);
          setFormData({
            name: "",
            tg_username: "",
            phone_number: "",
          });

          // Redirect based on user role
          setTimeout(() => {
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
          }, 1500);
        } else {
          // If no token, redirect to login
          setSuccess(true);
          setFormData({
            name: "",
            tg_username: "",
            phone_number: "",
          });
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } else {
        setError(
          data.message ||
            data.error ||
            "Регистрация не удалась. Пожалуйста, попробуйте еще раз."
        );
      }
    } catch (err) {
      setError(
        "Ошибка сети. Пожалуйста, проверьте подключение к интернету и попробуйте еще раз."
      );
      console.error("Registration error:", err);
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
                Регистрация
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mb-6 text-center">
                Создать новый аккаунт
              </p>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                  ✅ Регистрация успешна! Перенаправление...
                </div>
              )}

              <form
                onSubmit={handleFormSubmit}
                className="space-y-4 sm:space-y-5 md:space-y-6">
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="Полное имя"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="text"
                  name="tg_username"
                  value={formData.tg_username}
                  onChange={handleInputChange}
                  label="Имя пользователя Telegram"
                  placeholder="@username"
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  label="Номер телефона"
                  placeholder="+998901234567"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-doctor-olive hover:bg-doctor-gold text-white font-semibold"
                  loading={isSubmitting}>
                  {isSubmitting
                    ? "Регистрация..."
                    : "Зарегистрироваться"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Уже есть аккаунт?{" "}
                  <Link
                    to="/login"
                    className="text-doctor-olive hover:text-doctor-gold font-semibold">
                    Войдите здесь
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

export default Register;
