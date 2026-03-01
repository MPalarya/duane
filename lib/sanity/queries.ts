import { groq } from 'next-sanity';

// Blog queries
export const allBlogPostsQuery = groq`
  *[_type == "blogPost" && locale == $locale] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    featuredImage,
    publishedAt,
    readingTime,
    tags,
    author->{name, image}
  }
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && locale == $locale][0] {
    _id,
    title,
    slug,
    body,
    excerpt,
    featuredImage,
    publishedAt,
    readingTime,
    tags,
    author->{name, image, bio},
    "relatedPosts": *[_type == "blogPost" && locale == $locale && _id != ^._id && count(tags[@ in ^.tags]) > 0] | order(publishedAt desc) [0...3] {
      _id, title, slug, excerpt, featuredImage, publishedAt
    }
  }
`;

// Medical page queries
export const medicalPageQuery = groq`
  *[_type == "medicalPage" && slug.current == $slug && locale == $locale][0] {
    _id,
    title,
    slug,
    body,
    sources,
    lastReviewedDate,
    schemaType
  }
`;

// Community links
export const communityLinksQuery = groq`
  *[_type == "communityLink" && locale == $locale] | order(memberCount desc) {
    _id,
    name,
    url,
    platform,
    description,
    ogImage,
    ogTitle,
    memberCount
  }
`;

// Spotlight people
export const spotlightPeopleQuery = groq`
  *[_type == "spotlightPerson" && locale == $locale] | order(_createdAt desc) {
    _id,
    name,
    image,
    profession,
    bio,
    syndromeType,
    socialLinks
  }
`;

// Featured advocates
export const featuredAdvocatesQuery = groq`
  *[_type == "featuredAdvocate" && locale == $locale] | order(sortOrder asc, _createdAt desc) {
    _id,
    name,
    tags,
    bio,
    videoUrl,
    socialLinks
  }
`;

// Resources
export const resourcesQuery = groq`
  *[_type == "resource" && locale == $locale] | order(_createdAt desc) {
    _id,
    name,
    url,
    type,
    description
  }
`;
