import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@material-tailwind/react";
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, API_ENDPOINTS } from "../data/api";
import { getAuthToken } from "../utils/api";
import Footer from "../components/Footer";

function Services() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image_url: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    price: "",
    image_url: null,
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || (!isAdmin() && !isSuperAdmin())) {
      navigate("/admin/login");
      return;
    }

    fetchServices();
  }, [navigate, isAuthenticated, isAdmin, isSuperAdmin]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        throw new Error("Token topilmadi. Iltimos, qayta kirib ko'ring.");
      }

      // Fetch services from /doctor-services endpoint
      console.log("Fetching services from:", `${API_BASE_URL}${API_ENDPOINTS.services}`);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.services}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
        mode: "cors",
      });

      console.log("Services response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Xizmatlarni yuklash muvaffaqiyatsiz: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Services data received:", data);

      let servicesList = Array.isArray(data)
        ? data
        : data.data || data.services || [];

      // Process services to handle image URLs (convert relative to absolute)
      servicesList = servicesList.map((service) => {
        // Get image URL and handle relative URLs
        let imageUrl = service.image_url || service.imageUrl || service.image || null;
        
        // If image URL is just a filename (no path, no http), don't try to load it
        // This prevents 404 errors for images that aren't actually uploaded
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//') && !imageUrl.includes('/')) {
          // It's just a filename, not a valid URL - set to null to show placeholder
          imageUrl = null;
        } else if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('//')) {
          // If image URL is relative, make it absolute using the base URL (without /api for static assets)
          const BASE_URL_FOR_IMAGES = API_BASE_URL.replace('/api', '');
          if (imageUrl.startsWith('/')) {
            imageUrl = `${BASE_URL_FOR_IMAGES}${imageUrl}`;
          } else {
            imageUrl = `${BASE_URL_FOR_IMAGES}/${imageUrl}`;
          }
        }

        return {
          ...service,
          image_url: imageUrl,
          imageUrl: imageUrl,
          image: imageUrl,
        };
      });

      // Debug: Log first service to see image fields
      if (servicesList.length > 0) {
        console.log("First service image fields:", {
          image_url: servicesList[0].image_url,
          imageUrl: servicesList[0].imageUrl,
          image: servicesList[0].image
        });
      }

      setServices(servicesList);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err.message || "Xizmatlarni yuklash muvaffaqiyatsiz");
    } finally {
      setLoading(false);
    }
  };


  const handleAddService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Token topilmadi. Iltimos, qayta kirib ko'ring.");
      }

      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", parseInt(formData.price).toString());
      formDataToSend.append("duration", "30"); // Дефолтное значение 30 минут
      
      // Add image if selected
      if (formData.image_url) {
        const file = formData.image_url;
        const fileName = file.name.toLowerCase();
        let finalFileName = fileName;
        
        // If file doesn't have extension, add based on MIME type
        if (!fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            finalFileName = fileName.endsWith('.') ? fileName + 'jpg' : fileName + '.jpg';
          } else if (file.type === 'image/png') {
            finalFileName = fileName.endsWith('.') ? fileName + 'png' : fileName + '.png';
          } else if (file.type === 'image/gif') {
            finalFileName = fileName.endsWith('.') ? fileName + 'gif' : fileName + '.gif';
          }
        }
        
        // Create a new File object with the correct name if needed
        const fileToSend = finalFileName !== fileName 
          ? new File([file], finalFileName, { type: file.type })
          : file;
        
        formDataToSend.append("image_url", fileToSend);
      }

      // Create new service using POST /doctor-services
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.services}`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type header - browser will set it with boundary for FormData
        },
        body: formDataToSend,
        mode: "cors",
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        setSuccess("Xizmat muvaffaqiyatli qo'shildi!");
        setFormData({
          name: "",
          price: "",
          image_url: null,
        });
        setShowAddForm(false);
        fetchServices(); // Refresh services list
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(
          data.message || data.error || "Xizmat qo'shish muvaffaqiyatsiz"
        );
      }
    } catch (err) {
      console.error("Error adding service:", err);
      setError(err.message || "Tarmoq xatosi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    const serviceImageUrl = service.image_url || service.imageUrl || service.image;
    setEditFormData({
      name: service.name || "",
      price: service.price ? String(service.price) : "", // Convert to string for input
      image_url: null, // New image file will be stored here
    });
    setEditImagePreview(serviceImageUrl || null);
    setError("");
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!editingService) return;

    setIsSubmittingEdit(true);
    setError("");
    setSuccess("");

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Token topilmadi. Iltimos, qayta kirib ko'ring.");
      }

      const serviceId = editingService.id || editingService._id;

      // If image is provided, use FormData, otherwise use JSON
      if (editFormData.image_url) {
        // Use FormData for multipart/form-data when image is provided
        const formDataToSend = new FormData();
        formDataToSend.append("name", editFormData.name);
        // Handle price - convert to number then back to string for FormData
        const priceValue = editFormData.price ? (typeof editFormData.price === 'string' ? parseInt(editFormData.price) : editFormData.price) : 0;
        formDataToSend.append("price", String(priceValue));
        formDataToSend.append("duration", "30"); // Дефолтное значение 30 минут
        
        // Handle image file
        const file = editFormData.image_url;
        const fileName = file.name.toLowerCase();
        let finalFileName = fileName;

        if (!fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
          if (file.type === "image/jpeg" || file.type === "image/jpg") {
            finalFileName = fileName.endsWith(".") ? fileName + "jpg" : fileName + ".jpg";
          } else if (file.type === "image/png") {
            finalFileName = fileName.endsWith(".") ? fileName + "png" : fileName + ".png";
          } else if (file.type === "image/gif") {
            finalFileName = fileName.endsWith(".") ? fileName + "gif" : fileName + ".gif";
          }
        }

        const fileToSend = finalFileName !== fileName
          ? new File([file], finalFileName, { type: file.type })
          : file;

        formDataToSend.append("image_url", fileToSend);

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.services}/${serviceId}`,
          {
            method: "PATCH",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
              // Don't set Content-Type header - browser will set it with boundary for FormData
            },
            body: formDataToSend,
            mode: "cors",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setSuccess("Xizmat muvaffaqiyatli yangilandi!");
          setEditingService(null);
          setEditFormData({
            name: "",
            price: "",
            image_url: null,
          });
          setEditImagePreview(null);
          fetchServices(); // Refresh services list
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.message || data.error || "Xizmatni yangilash muvaffaqiyatsiz");
        }
      } else {
        // Use JSON when no image is provided
        const priceValue = editFormData.price ? (typeof editFormData.price === 'string' ? parseInt(editFormData.price) : editFormData.price) : 0;
        const updateData = {
          name: editFormData.name,
          price: priceValue,
          duration: 30, // Дефолтное значение 30 минут
        };

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.services}/${serviceId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
            mode: "cors",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setSuccess("Xizmat muvaffaqiyatli yangilandi!");
          setEditingService(null);
          setEditFormData({
            name: "",
            price: "",
            image_url: null,
          });
          setEditImagePreview(null);
          fetchServices(); // Refresh services list
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.message || data.error || "Xizmatni yangilash muvaffaqiyatsiz");
        }
      }
    } catch (err) {
      console.error("Error updating service:", err);
      setError(err.message || "Tarmoq xatosi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Bu xizmatni o'chirishni xohlaysizmi?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = getAuthToken();
      if (!token) {
        throw new Error("Token topilmadi. Iltimos, qayta kirib ko'ring.");
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.services}/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          mode: "cors",
        }
      );

      if (response.ok) {
        setSuccess("Xizmat muvaffaqiyatli o'chirildi!");
        fetchServices(); // Refresh services list
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Xizmatni o'chirish muvaffaqiyatsiz");
      }
    } catch (err) {
      console.error("Error deleting service:", err);
      setError(err.message || "Tarmoq xatosi. Iltimos, qayta urinib ko'ring.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files && files[0];
      if (file) {
        // Validate file extension
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension) {
          setError("Faqat JPG, JPEG, PNG yoki GIF formatidagi rasmlar qabul qilinadi");
          return;
        }
        
        // Validate MIME type
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!validMimeTypes.includes(file.type)) {
          setError("Noto'g'ri fayl formati. Faqat rasm fayllari qabul qilinadi");
          return;
        }
      }
      setFormData({
        ...formData,
        [name]: file || null,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    if (error) setError("");
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files && files[0];
      if (file) {
        // Validate file extension
        const fileName = file.name.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension) {
          setError("Faqat JPG, JPEG, PNG yoki GIF formatidagi rasmlar qabul qilinadi");
          return;
        }
        
        // Validate MIME type
        const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!validMimeTypes.includes(file.type)) {
          setError("Noto'g'ri fayl formati. Faqat rasm fayllari qabul qilinadi");
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
      setEditFormData({
        ...editFormData,
        [name]: file || null,
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
    }
    if (error) setError("");
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-doctor-gold mx-auto mb-4"></div>
          <p className="text-black dark:text-white">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-20 md:pt-[92px] min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white">
              Xizmatlar Boshqaruvi
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/admin")}
                size="sm"
                className="bg-doctor-olive hover:bg-doctor-gold">
                Admin paneli
              </Button>
              <Button
                onClick={logout}
                size="sm"
                variant="outlined"
                className="border-red-500 dark:border-red-600 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">
                Chiqish
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm mb-4">
              {success}
            </div>
          )}

          <div className="mb-6">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-doctor-olive hover:bg-doctor-gold text-white">
              {showAddForm ? "Formani yopish" : "+ Yangi xizmat qo'shish"}
            </Button>
          </div>

          {showAddForm && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-6">
                Yangi xizmat qo'shish
              </h2>
              <form
                onSubmit={handleAddService}
                className="space-y-4 sm:space-y-5 md:space-y-6">
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  label="Xizmat nomi"
                  placeholder="Masalan: Soch olish"
                  required
                  size="lg"
                  disabled={isSubmitting}
                />

                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  label="Narx (UZS)"
                  placeholder="50000"
                  required
                  min="0"
                  size="lg"
                  disabled={isSubmitting}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Xizmat rasmi (ixtiyoriy)
                  </label>
                  <input
                    type="file"
                    name="image_url"
                    accept="image/jpeg,image/png,image/jpg,image/gif,.jpg,.jpeg,.png,.gif"
                    onChange={handleInputChange}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-doctor-olive file:text-white hover:file:bg-doctor-gold"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="bg-doctor-olive hover:bg-doctor-gold text-white font-semibold"
                    loading={isSubmitting}>
                    {isSubmitting ? "Qo'shilmoqda..." : "Xizmat qo'shish"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        name: "",
                        price: "",
                        image_url: null,
                      });
                      setError("");
                    }}
                    size="lg"
                    variant="outlined"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-doctor-dark text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Rasm
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Xizmat nomi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Narx
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Davomiyligi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {services.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Xizmatlar topilmadi
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => {
                      const serviceImageUrl = service.image_url || service.imageUrl || service.image;
                      return (
                        <tr
                          key={service.id || service._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-black dark:text-white">
                            {service.id || service._id}
                          </td>
                          <td className="px-4 py-3">
                            {serviceImageUrl ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                <img
                                  src={serviceImageUrl}
                                  alt={service.name || "Service"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400 dark:text-gray-500 text-xs">Error</span></div>';
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-gray-400 dark:text-gray-500 text-xs">No image</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-black dark:text-white">
                            {service.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-black dark:text-white">
                            {formatCurrency(service.price || 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-black dark:text-white">
                            {service.duration ? `${service.duration} daqiqa` : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditService(service)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs">
                                Tahrirlash
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleDeleteService(service.id || service._id)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs">
                                O'chirish
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-black mb-4">
              Xizmatni tahrirlash
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateService} className="space-y-4">
              <Input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditInputChange}
                label="Xizmat nomi"
                required
                size="lg"
                disabled={isSubmittingEdit}
              />

              <Input
                type="number"
                name="price"
                value={editFormData.price}
                onChange={handleEditInputChange}
                label="Narx (UZS)"
                required
                min="0"
                size="lg"
                disabled={isSubmittingEdit}
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Xizmat rasmi (ixtiyoriy - yangi rasm yuklash)
                </label>
                {editImagePreview && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Joriy rasm:</p>
                    <img
                      src={editImagePreview}
                      alt="Current service"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
                <input
                  type="file"
                  name="image_url"
                  accept="image/jpeg,image/png,image/jpg,image/gif,.jpg,.jpeg,.png,.gif"
                  onChange={handleEditInputChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-doctor-olive file:text-white hover:file:bg-doctor-gold"
                  disabled={isSubmittingEdit}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Yangi rasm yuklasangiz, eski rasm o'rniga yangisi qo'yiladi
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setEditFormData({
                      name: "",
                      price: "",
                      image_url: null,
                    });
                    setEditImagePreview(null);
                    setError("");
                  }}
                  variant="outlined"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  disabled={isSubmittingEdit}>
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmittingEdit}
                  loading={isSubmittingEdit}>
                  {isSubmittingEdit ? "Yangilanmoqda..." : "Yangilash"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <Analytics />
    </div>
  );
}

export default Services;

