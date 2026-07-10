import type { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/rental-car`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/maintenance`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/car-sales`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/insurance`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/antique`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...blogRoutes]
}
