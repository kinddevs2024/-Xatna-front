import { useState, useEffect } from "react";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Button, Input } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { whyChooseUs, contactInfo } from "../data";
import { imagePool, getImagesInOrder } from "../data/images";
import {
  API_BASE_URL,
  API_ENDPOINTS,
} from "../data/api";
import { fetchWithTimeout } from "../utils/api";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation, translations } from "../data/translations";
import ServiceCard from "../components/ServiceCard";
import ContactForm from "../components/ContactForm";
import RegisterModal from "../components/RegisterModal";
import Footer from "../components/Footer";
import { Analytics } from "@vercel/analytics/react";
import ImageLightbox from "../components/ImageLightbox";

function Home() {
  const { language } = useLanguage();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [galleryPage, setGalleryPage] = useState(1);
  const imagesPerPage = 8;
  
  // Booking form state
  const [bookingFormData, setBookingFormData] = useState({
    service_ids: [],
    date: new Date().toISOString().split("T")[0],
    time: "",
    name: "",
    phone: "+998",
  });
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingCalendarMonth, setBookingCalendarMonth] = useState(new Date());
  
  // Generate 30-minute time slots (9:00 to 17:00)
  const generate30MinuteSlots = (startHour = 9, endHour = 17) => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };
  
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  
  // Загружаем доступные временные слоты при изменении даты
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!bookingFormData.date) {
        const defaultSlots = generate30MinuteSlots();
        setAvailableTimeSlots(defaultSlots);
        return;
      }

      setLoadingTimeSlots(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/bookings/available-slots?date=${bookingFormData.date}&doctor_id=1`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            mode: "cors",
          }
        );

        if (response.ok) {
          const data = await response.json();
          let slots = data.available_slots || [];
          
          // Фильтруем прошедшие времена, если выбранная дата - сегодня
          const selectedDate = new Date(bookingFormData.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          selectedDate.setHours(0, 0, 0, 0);
          
          if (selectedDate.getTime() === today.getTime()) {
            // Если выбран сегодня, фильтруем прошедшие времена
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes(); // Текущее время в минутах
            
            slots = slots.filter(slot => {
              const [slotHour, slotMinute] = slot.split(':').map(Number);
              const slotTime = slotHour * 60 + slotMinute; // Время слота в минутах
              
              // Оставляем только времена, которые еще не прошли (с запасом 30 минут)
              return slotTime > currentTime;
            });
          }
          
          setAvailableTimeSlots(slots);
          
          // Если выбранное время больше не доступно, сбрасываем его
          if (bookingFormData.time && !slots.includes(bookingFormData.time)) {
            setBookingFormData((prev) => ({
              ...prev,
              time: "",
            }));
          }
        } else {
          // Если не удалось загрузить, используем все возможные слоты
          const defaultSlots = generate30MinuteSlots();
          setAvailableTimeSlots(defaultSlots);
        }
      } catch (error) {
        console.error("Error fetching available slots:", error);
        // Если ошибка, используем все возможные слоты
        const defaultSlots = generate30MinuteSlots();
        setAvailableTimeSlots(defaultSlots);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [bookingFormData.date]);
  
  const timeSlots = availableTimeSlots.length > 0 ? availableTimeSlots : generate30MinuteSlots();
  
  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };
  
  const isDateSelected = (day) => {
    if (!day || !bookingFormData.date) return false;
    const year = bookingCalendarMonth.getFullYear();
    const month = bookingCalendarMonth.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookingFormData.date === dateString;
  };
  
  const isDateToday = (day) => {
    if (!day) return false;
    const today = new Date();
    const year = bookingCalendarMonth.getFullYear();
    const month = bookingCalendarMonth.getMonth();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };
  
  const isDatePast = (day) => {
    if (!day) return false;
    const today = new Date();
    const year = bookingCalendarMonth.getFullYear();
    const month = bookingCalendarMonth.getMonth();
    const date = new Date(year, month, day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };
  
  const handleDateSelect = (day) => {
    if (!day || isDatePast(day)) return;
    const year = bookingCalendarMonth.getFullYear();
    const month = bookingCalendarMonth.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setBookingFormData(prev => ({ ...prev, date: dateString }));
  };
  
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  
  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  // Get translated whyChooseUs
  const translatedWhyChooseUs =
    translations[language]?.whyChooseUs || whyChooseUs;

  // Fetch comments from API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const response = await fetchWithTimeout(
          `${API_BASE_URL}${API_ENDPOINTS.comments}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
            mode: "cors",
          },
          5000
        );

        if (response.ok) {
          const data = await response.json();
          // Transform API response to match display format
          const transformedComments = Array.isArray(data)
            ? data
                .filter((item) => item.comment && item.comment.trim() !== "")
                .map((item) => ({
                  name:
                    item.client_name ||
                    item.client?.name ||
                    item.name ||
                    getTranslation(language, "home.client"),
                  text: item.comment || item.message || "",
                  id: item.id || item._id,
                }))
                .slice(0, 6) // Limit to 6 comments
            : [];
          setComments(transformedComments);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        // Fallback to empty array on error
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, []);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        console.log(
          "Fetching services from:",
          `${API_BASE_URL}${API_ENDPOINTS.services}`
        );

        const response = await fetchWithTimeout(
          `${API_BASE_URL}${API_ENDPOINTS.services}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
              "Content-Type": "application/json",
            },
            mode: "cors",
          },
          5000
        );

        console.log(
          "Services response status:",
          response.status,
          response.statusText
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Services fetch error:", errorText);
          throw new Error(
            `Failed to fetch services: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Services data received:", data);
        // Handle both array response and object with data property
        let servicesList = Array.isArray(data)
          ? data
          : data.data || data.services || [];

        // Debug: Log first service to see what fields are available
        if (servicesList.length > 0) {
          console.log("First service from API:", servicesList[0]);
          console.log("Image URL fields:", {
            image_url: servicesList[0].image_url,
            imageUrl: servicesList[0].imageUrl,
            image: servicesList[0].image,
          });
        }

        // Map API response to expected format with icon mapping
        const mappedServices = (servicesList || []).map((service, index) => {
          // Map service name to icon type (handles both English and Uzbek)
          const getIconType = (name) => {
            const nameLower = (name || "").toLowerCase();
            // English keywords
            if (
              nameLower.includes("haircut") ||
              nameLower.includes("hair cut") ||
              nameLower.includes("hair") ||
              nameLower.includes("soch")
            ) {
              return "scissors";
            } else if (
              nameLower.includes("beard") ||
              nameLower.includes("soqol") ||
              nameLower.includes("facial") ||
              nameLower.includes("yuz")
            ) {
              return "beard";
            } else if (
              nameLower.includes("shave") ||
              nameLower.includes("razor") ||
              nameLower.includes("qirqish")
            ) {
              return "razor";
            } else if (
              nameLower.includes("kid") ||
              nameLower.includes("child") ||
              nameLower.includes("bola")
            ) {
              return "kid";
            }
            return "scissors"; // default
          };

          // Format price for display
          const formatPrice = (price) => {
            if (!price) return "N/A";
            const numPrice = parseFloat(price);
            if (isNaN(numPrice)) return price;
            // Format as currency (UZS)
            return new Intl.NumberFormat("uz-UZ", {
              style: "currency",
              currency: "UZS",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(numPrice);
          };

          // Get image URL - check multiple possible field names and handle relative URLs
          let imageUrl =
            service.image_url || service.imageUrl || service.image || null;

          // If image URL is just a filename (no path, no http), don't try to load it
          // This prevents 404 errors for images that aren't actually uploaded
          if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("//") && !imageUrl.includes("/")) {
            // It's just a filename, not a valid URL - set to null to show placeholder
            imageUrl = null;
          } else if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("//")) {
            // If image URL is relative, make it absolute using the base URL (without /api for static assets)
            const BASE_URL_FOR_IMAGES = API_BASE_URL.replace('/api', '');
            if (imageUrl.startsWith("/")) {
              imageUrl = `${BASE_URL_FOR_IMAGES}${imageUrl}`;
            } else {
              imageUrl = `${BASE_URL_FOR_IMAGES}/${imageUrl}`;
            }
          }

          return {
            id: service.id || service._id || index + 1,
            name: service.name || service.title || "Service",
            icon: service.icon || getIconType(service.name || service.title),
            image_url: imageUrl,
            description:
              service.description ||
              service.desc ||
              service.about ||
              `${
                service.duration
                  ? `${service.duration} min`
                  : "Professional service"
              }`,
            price: service.price ? formatPrice(service.price) : null,
            duration: service.duration || null,
            originalPrice: service.price || null,
          };
        });

        setServices(mappedServices);
      } catch (err) {
        console.error("Error fetching services:", err);
        console.error("Error details:", {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
        // Don't use fallback - only use data from API
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    setBookingError("");
    setBookingSuccess(false);

    try {
      const contactInfo = bookingFormData.phone || "";
      
      if (!contactInfo || contactInfo === "+998") {
        setBookingError("Пожалуйста, введите номер телефона");
        setIsSubmittingBooking(false);
        return;
      }

      // Validate date is not in the past
      const selectedDate = new Date(bookingFormData.date);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < todayDate) {
        setBookingError("O'tgan sanani tanlash mumkin emas");
        setIsSubmittingBooking(false);
        return;
      }

      // Validate time is not in the past (if date is today)
      if (selectedDate.getTime() === todayDate.getTime() && bookingFormData.time) {
        const now = new Date();
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        const [hours, minutes] = bookingFormData.time.split(':').map(Number);
        const slotTimeMinutes = hours * 60 + minutes;
        
        if (slotTimeMinutes <= currentTimeMinutes) {
          setBookingError("O'tgan vaqtni tanlash mumkin emas");
          setIsSubmittingBooking(false);
          return;
        }
      }
      
      const bookingData = {
        phone_number: contactInfo,
        doctor_id: 1, // Fixed medic ID (API uses doctor_id)
        service_ids: bookingFormData.service_ids.map((id) => parseInt(id)),
        date: bookingFormData.date,
        time: bookingFormData.time,
        client_name: bookingFormData.name,
      };

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.bookings}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify(bookingData),
          mode: "cors",
        }
      );

      const data = await response.json();

      if (response.ok || response.status === 201) {
        setBookingSuccess(true);
        setBookingFormData({
          service_ids: [],
          date: new Date().toISOString().split("T")[0],
          time: "",
          name: "",
          phone: "+998",
        });
        setTimeout(() => setBookingSuccess(false), 5000);
      } else {
        setBookingError(data.message || data.error || "Ошибка при создании записи");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(err.message || "Ошибка сети");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Use only API services - no fallback to static data
  const displayServices = services;
  const homeServices = displayServices.slice(0, 4);

  // Use services from API for pricing (convert to pricing format)
  const homePricing = displayServices.slice(0, 8).map((service) => ({
    id: service.id,
    name: service.name,
    price:
      service.price ||
      (service.originalPrice
        ? `${parseFloat(service.originalPrice).toLocaleString("uz-UZ")} UZS`
        : "N/A"),
  }));

  const handleRegisterModal = () => {
    setRegisterModalOpen(!registerModalOpen);
  };

  const handleImageClick = (index, images) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  return (
    <div>
      <Analytics />
      {/* Hero Section - Full Page */}
      <section id="home" className="w-full h-screen relative overflow-hidden bg-doctor-dark dark:bg-gray-900">
        {/* Content Container */}
        <div className="relative z-10 h-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[126px] flex flex-col lg:flex-row items-center justify-center lg:justify-between pt-20 sm:pt-[104px] md:pt-[124px] lg:pt-0 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Image - First on Mobile, Right on Desktop */}
          <div
            className="flex-1 w-full lg:w-auto lg:max-w-[680px] flex items-center justify-center order-1 lg:order-2  lg:mt-0"
            data-aos="fade-up"
          >
            <div className="relative w-full h-[300px] xs:h-[650px] sm:h-[400px] md:h-[500px] lg:h-[800px] xl:h-[900px] 2xl:h-[1000px] rounded-2xl sm:rounded-3xl lg:rounded-[35px] overflow-hidden shadow-2xl">
              <img
                src={imagePool[0]}
                alt="Xatna Markazi - Медицинский центр, хатна амалиёти в Ташкенте"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          {/* Content - Second on Mobile, Left on Desktop */}
          <div
            className="flex-1 flex flex-col justify-center lg:justify-start lg:pt-[100px] z-10 w-full lg:w-auto order-2 lg:order-1 text-center md:text-left"
            data-aos="fade-up"
          >
            <div className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4 tracking-wider">
              {getTranslation(language, "home.welcome")}
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
              {contactInfo.tagline}
            </h1>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-white mb-2 sm:mb-3 opacity-90">
              {getTranslation(language, "contact.description")}
            </p>
            <p className="text-sm xs:text-base sm:text-lg md:text-xl text-white mb-4 sm:mb-6 md:mb-8 opacity-80">
              {getTranslation(language, "contact.subtitle")}
            </p>
            <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-6 sm:mb-8 md:mb-10 flex flex-col items-center sm:items-center md:items-start">
              <div className="flex items-center gap-2 sm:gap-3 text-white text-sm sm:text-base md:text-lg">
                <PhoneIcon
                  className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-white"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="hover:text-doctor-gold transition-colors break-all text-white"
                >
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-white text-sm sm:text-base md:text-lg">
                <EnvelopeIcon
                  className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-white"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-doctor-gold transition-colors break-all text-white"
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
            <div className="flex justify-center sm:justify-center md:justify-start">
              <Button
                size="lg"
                variant="outlined"
                onClick={() => {
                  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-transparent border-2 border-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg text-white hover:bg-white hover:text-gray-800"
                aria-label="Book an appointment online"
              >
                {getTranslation(language, "home.bookOnline")}
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce hidden lg:block">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      <div>
        {/* Services Overview Section */}
        <section
          className="w-full bg-white dark:bg-gray-900 py-8 sm:py-10 md:py-12 lg:py-16"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
            {loadingServices && (
              <div className="text-center py-8">
                <p className="text-black dark:text-white text-lg">
                  {getTranslation(language, "home.loadingServices")}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {homeServices.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us & Working Hours Section */}
        <section
          className="w-full bg-doctor-dark py-8 sm:py-10 md:py-12 lg:py-20 relative"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px] grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <div className="text-white relative z-10" data-aos="fade-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                {getTranslation(language, "home.whyChooseUs")}
              </h2>
              <div className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 opacity-90 whitespace-pre-line leading-relaxed">
                {getTranslation(language, "home.whyChooseUsDesc").replace(
                  "{tagline}",
                  contactInfo.tagline
                )}
              </div>
            </div>
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 relative z-10"
              data-aos="fade-up"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white mb-4 sm:mb-6">
                {getTranslation(language, "home.workingHours")}
              </h2>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 md:mb-8">
                {contactInfo.workingHours.map((schedule, i) => {
                  // Map Russian day names to translation keys
                  const dayMap = {
                    ВОСКРЕСЕНЬЕ: "sunday",
                    ПОНЕДЕЛЬНИК: "monday",
                    ВТОРНИК: "tuesday",
                    СРЕДА: "wednesday",
                    ЧЕТВЕРГ: "thursday",
                    ПЯТНИЦА: "friday",
                    СУББОТА: "saturday",
                  };
                  const dayKey =
                    dayMap[schedule.day] || schedule.day.toLowerCase();
                  const translatedDay =
                    getTranslation(language, `workingHours.${dayKey}`) ||
                    schedule.day;
                  return (
                    <div
                      key={i}
                      className="text-black dark:text-white font-medium text-sm sm:text-base"
                    >
                      {translatedDay} {schedule.hours}
                    </div>
                  );
                })}
              </div>
              <Button
                size="lg"
                variant="outlined"
                onClick={() => {
                  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Book an appointment online"
              >
                {getTranslation(language, "nav.booking")}
              </Button>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section
          id="booking"
          className="w-full bg-white dark:bg-gray-900 py-8 sm:py-10 md:py-12 lg:py-20"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white text-center mb-6 sm:mb-8 md:mb-12">
              {getTranslation(language, "booking.title")}
            </h2>
            
            <div className="max-w-2xl mx-auto">
              {bookingSuccess && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm mb-4">
                  ✅ {getTranslation(language, "booking.success")}
                </div>
              )}
              
              {bookingError && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
                  ❌ {bookingError}
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="space-y-6">
                  {/* Helpful Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>📋 Как записаться:</strong> Выберите услугу, дату и время, затем заполните ваши контактные данные.
                    </p>
                  </div>
                  {/* Services Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      {getTranslation(language, "booking.selectServices")}
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-normal ml-2">
                        (Выберите одну или несколько услуг)
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {services.slice(0, 6).map((service) => {
                        const isSelected = bookingFormData.service_ids.includes(String(service.id));
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              const serviceId = String(service.id);
                              setBookingFormData(prev => ({
                                ...prev,
                                service_ids: isSelected
                                  ? prev.service_ids.filter(id => id !== serviceId)
                                  : [...prev.service_ids, serviceId]
                              }));
                            }}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              isSelected
                                ? "border-doctor-olive bg-doctor-olive/10 dark:bg-doctor-olive/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-doctor-olive/50"
                            }`}
                          >
                            <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                              {service.name}
                            </h3>
                            {service.price && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {service.price}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Selection - Visual Calendar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <CalendarDaysIcon className="w-5 h-5 text-doctor-olive" />
                      <span>{getTranslation(language, "booking.selectDate")}</span>
                      {bookingFormData.date && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                          {new Date(bookingFormData.date + 'T00:00:00').toLocaleDateString('ru-RU', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                      )}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      💡 Нажмите на дату в календаре, чтобы выбрать
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={() => setBookingCalendarMonth(new Date(bookingCalendarMonth.getFullYear(), bookingCalendarMonth.getMonth() - 1, 1))}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          {monthNames[bookingCalendarMonth.getMonth()]} {bookingCalendarMonth.getFullYear()}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setBookingCalendarMonth(new Date(bookingCalendarMonth.getFullYear(), bookingCalendarMonth.getMonth() + 1, 1))}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                      
                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-2">
                        {/* Day headers */}
                        {dayNames.map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar cells */}
                        {getDaysInMonth(bookingCalendarMonth).map((day, index) => {
                          if (!day) {
                            return <div key={`empty-${index}`} className="h-10"></div>;
                          }
                          const isSelected = isDateSelected(day);
                          const isToday = isDateToday(day);
                          const isPast = isDatePast(day);
                          
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleDateSelect(day)}
                              disabled={isPast}
                              className={`
                                h-10 w-10 sm:h-12 sm:w-12 rounded-lg text-sm sm:text-base font-medium transition-all transform hover:scale-105
                                ${isPast 
                                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-100 dark:bg-gray-800 opacity-50" 
                                  : isSelected
                                  ? "bg-doctor-olive text-white shadow-lg scale-110 ring-2 ring-doctor-olive ring-offset-2 font-bold"
                                  : isToday
                                  ? "bg-doctor-gold/30 text-doctor-olive border-2 border-doctor-olive font-bold hover:bg-doctor-olive/20"
                                  : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-doctor-olive/10 hover:border-doctor-olive hover:border-2 border border-gray-300 dark:border-gray-500"
                                }
                              `}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {bookingFormData.date && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                          ✅ Выбрана дата: <span className="font-bold">
                            {new Date(bookingFormData.date + 'T00:00:00').toLocaleDateString('ru-RU', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Time Selection - Visual Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-doctor-olive" />
                      <span>{getTranslation(language, "booking.selectTime")}</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      💡 Нажмите на удобное для вас время
                    </p>
                    {loadingTimeSlots ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-doctor-olive mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mavjud vaqtlar yuklanmoqda...
                        </p>
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                          Bu kunda mavjud vaqtlar yo'q
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {timeSlots.map((time) => {
                          const isSelected = bookingFormData.time === time;
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setBookingFormData(prev => ({ ...prev, time }))}
                              className={`
                                py-3 px-4 rounded-xl font-semibold text-base transition-all transform hover:scale-105
                                ${isSelected
                                  ? "bg-doctor-olive text-white shadow-lg scale-105 ring-2 ring-doctor-olive ring-offset-2"
                                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-doctor-olive/10 hover:border-doctor-olive border-2 border-gray-300 dark:border-gray-600"
                                }
                              `}
                            >
                              {time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {bookingFormData.time && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300 text-center">
                          ✅ Выбрано время: <span className="font-bold text-lg">{bookingFormData.time}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <Input
                    type="text"
                    label={getTranslation(language, "booking.name")}
                    value={bookingFormData.name}
                    onChange={(e) => setBookingFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-white dark:bg-gray-700"
                  />

                  {/* Phone */}
                  <Input
                    type="tel"
                    label={getTranslation(language, "booking.phone")}
                    value={bookingFormData.phone}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (!value.startsWith("+998")) {
                        value = "+998" + value.replace(/^\+998/, "");
                      }
                      setBookingFormData(prev => ({ ...prev, phone: value }));
                    }}
                    placeholder={getTranslation(language, "booking.phonePlaceholder")}
                    required
                    className="bg-white dark:bg-gray-700"
                  />


                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmittingBooking || bookingFormData.service_ids.length === 0}
                    className="w-full bg-doctor-olive hover:bg-doctor-gold text-white font-semibold"
                  >
                    {isSubmittingBooking 
                      ? getTranslation(language, "booking.creating")
                      : getTranslation(language, "booking.createBooking")
                    }
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Our Pricing Section */}
        <section
          id="narxlar"
          className="w-full bg-white dark:bg-gray-900 py-8 sm:py-10 md:py-12 lg:py-20"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white text-center mb-6 sm:mb-8 md:mb-12">
              {getTranslation(language, "home.prices")}
            </h2>
            {loadingServices ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-black dark:text-white">
                  {getTranslation(language, "home.loadingPrices")}
                </p>
              </div>
            ) : homePricing.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  {getTranslation(language, "home.pricesNotFound")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-4xl mx-auto">
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {homePricing.slice(0, 4).map((item, i) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700"
                      data-aos="fade-up"
                      data-aos-delay={i * 50}
                    >
                      <span className="text-black dark:text-white font-medium text-sm sm:text-base">
                        {item.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm sm:text-base">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {homePricing.slice(4, 8).map((item, i) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700"
                      data-aos="fade-up"
                      data-aos-delay={i * 50}
                    >
                      <span className="text-black dark:text-white font-medium text-sm sm:text-base">
                        {item.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm sm:text-base">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Welcome to the Medical Center Section */}
        <section
          className="w-full bg-doctor-dark py-8 sm:py-10 md:py-12 lg:py-20"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px] grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="relative order-2 lg:order-1" data-aos="fade-up">
              <div className="w-full h-[300px] xs:h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <img
                  src={imagePool[1]}
                  alt="Профессиональные медицинские услуги в Xatna Markazi"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Decorative shapes */}
                <div className="absolute -top-8 -left-8 sm:-top-10 sm:-left-10 w-32 h-32 sm:w-40 sm:h-40 bg-doctor-gold dark:bg-doctor-gold rounded-full opacity-50 dark:opacity-40"></div>
                <div className="absolute -bottom-8 -right-8 sm:-bottom-10 sm:-right-10 w-24 h-24 sm:w-32 sm:h-32 bg-doctor-accent dark:bg-doctor-accent rounded-full opacity-50 dark:opacity-40"></div>
              </div>
            </div>
            <div
              className="bg-doctor-light dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 order-1 lg:order-2"
              data-aos="fade-up"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-3 sm:mb-4 md:mb-6">
                {getTranslation(language, "home.welcomeToPremium")}
              </h2>
              <p className="text-black dark:text-white mb-4 sm:mb-6 md:mb-8 leading-relaxed text-sm sm:text-base">
                {getTranslation(language, "home.welcomeToPremiumDesc")}
              </p>
              <Button
                size="lg"
                onClick={() => {
                  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-800 dark:hover:bg-gray-200"
                aria-label="Book an appointment online"
              >
                {getTranslation(language, "home.bookOnline")}
              </Button>
            </div>
          </div>
        </section>

        {/* Free Consultation Section */}
        <section
          className="w-full bg-white dark:bg-gray-900 py-8 sm:py-10 md:py-12 lg:py-20"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px] grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            <div className="order-2 lg:order-1" data-aos="fade-up">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-4 sm:mb-6 md:mb-8 leading-tight">
                {getTranslation(language, "home.contactdoctors")}
              </h2>
              <Button
                size="lg"
                variant="outlined"
                onClick={() => {
                  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                aria-label="Book an appointment online"
              >
                {getTranslation(language, "home.bookOnline")}
              </Button>
            </div>
            <div className="relative order-1 lg:order-2" data-aos="fade-up">
              <div className="w-full h-[300px] xs:h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl sm:rounded-3xl relative overflow-hidden">
                <img
                  src="/hero.jpg"
                  alt="Expert doctors at Xatna Markazi providing consultation"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Decorative shapes */}
                <div className="absolute -top-8 -left-8 sm:-top-10 sm:-left-10 w-32 h-32 sm:w-40 sm:h-40 bg-doctor-gold dark:bg-doctor-gold rounded-full opacity-50 dark:opacity-40"></div>
                <div className="absolute -bottom-8 -right-8 sm:-bottom-10 sm:-right-10 w-24 h-24 sm:w-32 sm:h-32 bg-doctor-accent dark:bg-doctor-accent rounded-full opacity-50 dark:opacity-40"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Медицинский центр Section */}
        <section
          className="w-full bg-doctor-olive py-8 sm:py-10 md:py-12 lg:py-20"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-12">
              {getTranslation(language, "home.doctorShop")}
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {(() => {
                const doctorShopImages = [
                  "/hero.jpg",
                  "/hero.jpg",
                  "/hero.jpg",
                  "/hero.jpg",
                  "/hero.jpg",
                  "/hero.jpg",
                  "/hero.jpg",
                ];
                return doctorShopImages.map((imgSrc, i) => (
                  <motion.div
                    key={i}
                    className="w-full h-[200px] xs:h-[220px] sm:h-[250px] md:h-[280px] lg:h-[300px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer"
                    data-aos="zoom-in"
                    data-aos-delay={i * 100}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleImageClick(i, doctorShopImages)}
                  >
                    <img
                      src={imgSrc}
                      alt={`Xatna Markazi медицинский центр ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        </section>

        {/* People Comments Section */}
        <section
          className="w-full bg-doctor-olive py-8 sm:py-10 md:py-12 lg:py-20"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-12">
              {getTranslation(language, "home.clientReviews")}
            </h2>
            {loadingComments ? (
              <div className="text-center py-8">
                <p className="text-white text-lg">
                  {getTranslation(language, "home.loadingReviews")}
                </p>
              </div>
            ) : comments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {comments.map((comment, i) => (
                  <motion.div
                    key={comment.id || i}
                    className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 relative"
                    data-aos="fade-up"
                    data-aos-delay={i * 200}
                    whileHover={{ y: -5 }}
                  >
                    <svg
                      className="absolute top-4 sm:top-5 md:top-6 left-4 sm:left-5 md:left-6 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-doctor-gold"
                      viewBox="0 0 30 30"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 20h8l-2-8H8c-1.1 0-2 .9-2 2v6zm12 0h8l-2-8h-4c-1.1 0-2 .9-2 2v6z"
                        fill="currentColor"
                      />
                    </svg>
                    <div className="flex items-center gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8 mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-doctor-gold rounded-full flex-shrink-0"></div>
                      <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white">
                        {comment.name}
                      </h3>
                    </div>
                    <p className="text-black dark:text-white text-sm sm:text-base">
                      {comment.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white text-lg opacity-70">
                  {getTranslation(language, "home.noReviews")}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section
          id="gallery"
          className="w-full bg-doctor-dark py-8 sm:py-10 md:py-12 lg:py-16"
          data-aos="fade-up"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-6 sm:mb-8 md:mb-12">
              {getTranslation(language, "gallery.title")}
            </h2>
            {(() => {
              const allGalleryImages = getImagesInOrder(16);
              const totalPages = Math.ceil(allGalleryImages.length / imagesPerPage);
              const startIndex = (galleryPage - 1) * imagesPerPage;
              const endIndex = startIndex + imagesPerPage;
              const currentImages = allGalleryImages.slice(startIndex, endIndex);
              
              return (
                <>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
                    {currentImages.map((imgSrc, i) => {
                      const globalIndex = startIndex + i;
                      return (
                        <motion.div
                          key={globalIndex}
                          className="w-full h-[200px] xs:h-[220px] sm:h-[250px] md:h-[280px] lg:h-[300px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer"
                          data-aos="zoom-in"
                          data-aos-delay={i * 50}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleImageClick(globalIndex, allGalleryImages)}
                        >
                          <img
                            src={imgSrc}
                            alt={`Gallery image ${globalIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                        disabled={galleryPage === 1}
                        className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-30 transition-colors"
                      >
                        {getTranslation(language, "gallery.back")}
                      </button>
                      <span className="text-white px-4">
                        {galleryPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setGalleryPage(p => Math.min(totalPages, p + 1))}
                        disabled={galleryPage === totalPages}
                        className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-30 transition-colors"
                      >
                        {getTranslation(language, "gallery.forward")}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>

        {/* Delivery/Contact Section */}
        <section id="contact" className="w-full bg-gradient-to-b dark:from-gray-900 dark:to-doctor-olive from-white to-doctor-olive py-8 sm:py-10 md:py-12 lg:py-16" data-aos="fade-up">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8 sm:mb-12" data-aos="fade-up">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold dark:text-white text-black mb-2">
                  {contactInfo.tagline}
                </h1>
                <p className="dark:text-white text-black opacity-90 text-base sm:text-lg mb-2">
                  {getTranslation(language, "contact.description")}
                </p>
                <p className="dark:text-white text-black opacity-80 text-sm sm:text-base">
                  {getTranslation(language, "contact.subtitle")}
                </p>
              </div>

              <motion.div
                className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl mb-6"
                data-aos="zoom-in"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2">Instagram</h2>
                    <p className="text-gray-600 text-sm sm:text-base mb-3">
                      {getTranslation(language, "delivery.followInstagram")}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-doctor-olive font-semibold text-sm sm:text-base">
                      <span>@xatna_markazi_n1</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>
              </motion.div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl" data-aos="fade-up">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-6 text-center">
                  {getTranslation(language, "delivery.contactInfo")}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-doctor-olive rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-2">{getTranslation(language, "delivery.address")}</h3>
                      <a 
                        href={contactInfo.location.yandexMapUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-doctor-olive hover:bg-doctor-gold text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md text-sm sm:text-base"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>📍 Открыть на карте</span>
                      </a>
                      <p className="text-gray-600 text-xs sm:text-sm mt-2">
                        {getTranslation(language, "contact.address")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-doctor-olive rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black mb-1">{getTranslation(language, "delivery.phone")}</h3>
                      <a href={`tel:${contactInfo.phone}`} className="text-gray-600 hover:text-doctor-olive transition-colors text-sm sm:text-base">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Register Modal */}
      <RegisterModal
        open={registerModalOpen}
        handleOpen={handleRegisterModal}
      />
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
      />
    </div>
  );
}

export default Home;
