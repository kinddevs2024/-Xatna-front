import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

function ImageLightbox({ images, currentIndex, isOpen, onClose }) {
  const [imageIndex, setImageIndex] = useState(currentIndex);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageIndex(currentIndex);
    setImageLoaded(false);
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setImageLoaded(false);
        setImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === "ArrowRight") {
        setImageLoaded(false);
        setImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next image
          setImageLoaded(false);
          setImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        } else {
          // Swipe right - previous image
          setImageLoaded(false);
          setImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, imageIndex, images.length, onClose]);

  const handlePrevious = () => {
    setImageLoaded(false);
    setImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setImageLoaded(false);
    setImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[imageIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          aria-modal="true"
          role="dialog"
          aria-label="Image gallery">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white hover:bg-opacity-10"
            aria-label="Close gallery">
            <XMarkIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 z-10 p-2 sm:p-3 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white hover:bg-opacity-10"
              aria-label="Previous image">
              <ChevronLeftIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 z-10 p-2 sm:p-3 text-white hover:text-gray-300 transition-colors rounded-full hover:bg-white hover:bg-opacity-10"
              aria-label="Next image">
              <ChevronRightIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </button>
          )}

          {/* Image Container */}
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            <motion.img
              key={imageIndex}
              src={currentImage}
              alt={`Gallery image ${imageIndex + 1} of ${images.length}`}
              className="max-w-full max-h-[90vh] object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setImageLoaded(true)}
              loading="eager"
            />
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-50 rounded-full text-white text-sm sm:text-base">
              {imageIndex + 1} / {images.length}
            </div>
          )}

          {/* Touch/Swipe Indicators (Mobile) */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white text-xs sm:text-sm opacity-70 hidden sm:block">
              Use arrow keys or swipe to navigate
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ImageLightbox;

