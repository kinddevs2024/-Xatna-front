import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@material-tailwind/react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getTranslation } from "../data/translations";
import { contactInfo } from "../data/contact";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin, isSuperAdmin } = useAuth();
  const { language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;

      // Always show header at the top of the page
      if (currentScrollY < 10) {
        setIsVisible(true);
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader, { passive: true });

    return () => {
      window.removeEventListener("scroll", controlHeader);
    };
  }, [lastScrollY]);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 z-50 shadow-md h-16 sm:h-20 md:h-[92px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[93px] h-full flex justify-between items-center">
        <Logo
          onClick={closeMobileMenu}
          linkTo={isAdmin() || isSuperAdmin() ? "/admin" : "/"}
        />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 lg:gap-8 items-center">
          {!isAdmin() && !isSuperAdmin() && (
            <>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-sm lg:text-base font-medium transition-colors text-black dark:text-white hover:text-barber-gold"
                aria-label="Navigate to Home">
                {getTranslation(language, "nav.home")}
              </a>
              <a
                href="#gallery"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm lg:text-base font-medium transition-colors text-black dark:text-white hover:text-barber-gold"
                aria-label="Navigate to Gallery">
                {getTranslation(language, "nav.gallery")}
              </a>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-sm lg:text-base font-medium transition-colors text-black dark:text-white hover:text-barber-gold"
                aria-label="Navigate to Contact">
                {getTranslation(language, "nav.contact")}
              </a>
            </>
          )}
          <a
            href="#booking"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 bg-barber-olive hover:bg-barber-gold text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm lg:text-base"
            aria-label="Navigate to Booking">
            🗓️ {getTranslation(language, "nav.booking")}
          </a>
          <LanguageSwitcher />
          {isAuthenticated() && (
            <>
              {isAdmin() && !isSuperAdmin() && (
                <>
                  <Link
                    to="/admin"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/admin")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.admin")}
                  </Link>
                  <Link
                    to="/users"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/users")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.users")}
                  </Link>
                  <Link
                    to="/services"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/services")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.services")}
                  </Link>
                  <Link
                    to="/analytics"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/analytics")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.statistics")}
                  </Link>
                  <Link
                    to="/broadcast"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/broadcast")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.broadcast")}
                  </Link>
                </>
              )}
              {isSuperAdmin() && (
                <>
                  <Link
                    to="/admin"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/admin")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.admin")}
                  </Link>
                  <Link
                    to="/users"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/users")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.users")}
                  </Link>
                  <Link
                    to="/services"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/services")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.services")}
                  </Link>
                  <Link
                    to="/analytics"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/analytics")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.statistics")}
                  </Link>
                  <Link
                    to="/broadcast"
                    className={`text-sm mt-1 lg:text-base font-medium transition-colors ${
                      isActive("/broadcast")
                        ? "text-barber-gold"
                        : "text-black dark:text-white hover:text-barber-gold"
                    }`}>
                    {getTranslation(language, "nav.broadcast")}
                  </Link>
                </>
              )}
              <Button
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className=" bg-barber-olive hover:bg-barber-gold text-white">
                {getTranslation(language, "nav.logout")}
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-black dark:text-white hover:text-barber-gold transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu">
          {mobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <nav className="flex flex-col px-4 py-4 space-y-4">
              {!isAdmin() && !isSuperAdmin() && (
                <>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-base font-medium py-2 text-left transition-colors text-black dark:text-white hover:text-barber-gold">
                    {getTranslation(language, "nav.home")}
                  </button>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-base font-medium py-2 text-left transition-colors text-black dark:text-white hover:text-barber-gold">
                    {getTranslation(language, "nav.gallery")}
                  </button>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-base font-medium py-2 text-left transition-colors text-black dark:text-white hover:text-barber-gold">
                    {getTranslation(language, "nav.contact")}
                  </button>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full mt-2 px-4 py-3 bg-barber-olive hover:bg-barber-gold text-white font-semibold rounded-lg transition-all text-center shadow-md">
                    🗓️ {getTranslation(language, "nav.booking")}
                  </button>
                </>
              )}
              <div className="py-2">
                <LanguageSwitcher variant="mobile" />
              </div>
              {isAuthenticated() && (
                <>
                  {isAdmin() && !isSuperAdmin() && (
                    <>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/admin");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/admin")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.admin")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/users");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/users")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.users")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/services");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/services")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.services")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/analytics");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/analytics")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.statistics")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/broadcast");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/broadcast")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.broadcast")}
                      </button>
                    </>
                  )}
                  {isSuperAdmin() && (
                    <>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/admin");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/admin")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.admin")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/users");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/users")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.users")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/services");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/services")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.services")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/analytics");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/analytics")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.statistics")}
                      </button>
                      <button
                        onClick={() => {
                          closeMobileMenu();
                          navigate("/broadcast");
                        }}
                        className={`text-base font-medium py-2 text-left transition-colors ${
                          isActive("/broadcast")
                            ? "text-barber-gold"
                            : "text-black dark:text-white hover:text-barber-gold"
                        }`}>
                        {getTranslation(language, "nav.broadcast")}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                      navigate("/");
                    }}
                    className="text-base font-medium py-2 text-left text-red-600 hover:text-red-700 transition-colors">
                    {getTranslation(language, "nav.logout")}
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;
