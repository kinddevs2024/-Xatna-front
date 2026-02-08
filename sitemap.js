export default function sitemap() {
    return [
      {
        url: 'https://001doctorshop.uz/',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: 'https://001doctorshop.uz/gallery',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: 'https://001doctorshop.uz/team',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: 'https://001doctorshop.uz/delivery',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: 'https://001doctorshop.uz/booking',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]
  }