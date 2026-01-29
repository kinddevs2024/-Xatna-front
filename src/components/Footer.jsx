import { contactInfo } from '../data/contact'
import { useLanguage } from '../context/LanguageContext'
import { getTranslation } from '../data/translations'

function Footer() {
  const { language } = useLanguage();
  
  return (
    <footer className="w-full bg-barber-dark py-6 sm:py-8 md:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[127px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <div className="mb-3 sm:mb-4">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:opacity-80 transition-opacity inline-block"
                aria-label="Xatna Markazi Home"
              >
                <img
                  src="/logo.png"
                  alt="Xatna Markazi Logo"
                  className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-auto object-contain drop-shadow-lg dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                />
              </a>
            </div>
            <p className="text-white opacity-80 text-sm sm:text-base">
              {getTranslation(language, "contact.tagline")}
            </p>
            <p className="text-white opacity-70 text-xs sm:text-sm mt-2">
              {getTranslation(language, "contact.description")}
            </p>
            <p className="text-white opacity-70 text-xs sm:text-sm mt-1">
              {getTranslation(language, "contact.subtitle")}
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">{getTranslation(language, "footer.contacts")}</h3>
            <a 
              href={contactInfo.location.yandexMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 rounded-lg transition-all text-white font-medium text-sm sm:text-base mb-3 break-words"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>📍 {getTranslation(language, "contact.address")}</span>
              <span className="text-xs opacity-70 ml-1">(На карте)</span>
            </a>
            <a href={`tel:${contactInfo.phone}`} className="text-white opacity-80 hover:text-barber-gold transition-colors text-sm sm:text-base break-all">
              {contactInfo.phone}
            </a>
          </div>
          <div>
            <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">{getTranslation(language, "footer.followUs")}</h3>
            <a
              href={contactInfo.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white opacity-80 hover:text-barber-gold transition-colors text-sm sm:text-base"
            >
              Instagram
            </a>
          </div>
        </div>
        <div className="border-t border-white border-opacity-20 pt-6 sm:pt-8 text-center">
          <p className="text-white opacity-60 text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} Xatna Markazi. {getTranslation(language, "footer.allRightsReserved")}.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
