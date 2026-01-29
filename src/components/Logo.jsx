import { useTheme } from "../context/ThemeContext";

function Logo({ className = "", linkTo = "/", onClick, variant = "light" }) {
  const { theme } = useTheme();
  
  // Use logo.png as logo for all themes
  const logoSrc = "/logo.png";
  
  const logoContent = (
    <img
      src={logoSrc}
      alt="Xatna Markazi Logo"
      className={`h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-auto object-contain drop-shadow-lg dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] ${className}`}
    />
  );

  if (linkTo) {
    return (
      <a
        href="#home"
        className="hover:opacity-80 transition-opacity inline-block"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (onClick) onClick();
        }}
        aria-label="Xatna Markazi Home"
      >
        {logoContent}
      </a>
    );
  }

  return logoContent;
}

export default Logo;
