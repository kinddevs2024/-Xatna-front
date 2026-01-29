// Image pool for Xatna Markazi website
// Using hero.jpg as the main image everywhere
export const imagePool = [
  "/hero.jpg", // Main hero image
];

// Get random images from the pool
export const getRandomImages = (count) => {
  const shuffled = [...imagePool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get images in order (cycling through the pool)
// Using hero.jpg for all images
export const getImagesInOrder = (count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push("/hero.jpg");
  }
  return result;
};

// Get all photos - using hero.jpg
export const getAllBarberPhotos = () => {
  return ["/hero.jpg"];
};
