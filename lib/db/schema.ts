import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users (from social login)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  image: text('image'),
  provider: text('provider'),
  anonymousAlias: text('anonymous_alias'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Newsletter subscribers
export const subscribers = sqliteTable('subscribers', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  locale: text('locale').default('en'),
  preferencesJson: text('preferences_json'),
  confirmed: integer('confirmed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Specialist directory
export const specialists = sqliteTable('specialists', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  country: text('country').notNull(),
  city: text('city'),
  type: text('type'), // adult | child | both
  specialty: text('specialty'),
  website: text('website'),
  phone: text('phone'),
  verified: integer('verified', { mode: 'boolean' }).default(false),
  ratingAvg: real('rating_avg').default(0),
  ratingCount: integer('rating_count').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Reviews for specialists
export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  specialistId: text('specialist_id').notNull().references(() => specialists.id),
  userId: text('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(),
  text: text('text'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  approved: integer('approved', { mode: 'boolean' }).default(false),
});

// Comments on blog posts
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  pageSlug: text('page_slug').notNull(),
  userId: text('user_id').notNull().references(() => users.id),
  text: text('text').notNull(),
  parentId: text('parent_id'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  approved: integer('approved', { mode: 'boolean' }).default(false),
});

// Success stories
export const stories = sqliteTable('stories', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  profession: text('profession'),
  content: text('content').notNull(),
  locale: text('locale').default('en'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  approved: integer('approved', { mode: 'boolean' }).default(false),
});

// Mentor/mentee board
export const mentorPosts = sqliteTable('mentor_posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  role: text('role').notNull(), // mentor | mentee
  bio: text('bio').notNull(),
  contactMethod: text('contact_method'),
  anonymous: integer('anonymous', { mode: 'boolean' }).default(false),
  locale: text('locale').default('en'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Legal entries by country
export const legalEntries = sqliteTable('legal_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  country: text('country').notNull(),
  topic: text('topic').notNull(),
  content: text('content').notNull(),
  sourcesJson: text('sources_json'),
  locale: text('locale').default('en'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  approved: integer('approved', { mode: 'boolean' }).default(false),
});

// Research papers cache
export const researchCache = sqliteTable('research_cache', {
  id: text('id').primaryKey(),
  pubmedId: text('pubmed_id').unique(),
  title: text('title').notNull(),
  abstract: text('abstract'),
  authors: text('authors'),
  journal: text('journal'),
  publishedDate: text('published_date'),
  aiSummarySimple: text('ai_summary_simple'),
  aiSummaryAdult: text('ai_summary_adult'),
  aiSummaryProfessional: text('ai_summary_professional'),
  fetchedAt: text('fetched_at').default(sql`(CURRENT_TIMESTAMP)`),
  // Multi-source & open access fields
  doi: text('doi'),
  pmcId: text('pmc_id'),
  s2Id: text('s2_id'),
  isOpenAccess: integer('is_open_access', { mode: 'boolean' }).default(false),
  oaPdfUrl: text('oa_pdf_url'),
  conclusions: text('conclusions'),
  fullTextSource: text('full_text_source'),
  source: text('source').default('pubmed'),
  citationCount: integer('citation_count').default(0),
});

// Generic submissions
export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  type: text('type').notNull(), // specialist | blog | sponsor | spotlight
  dataJson: text('data_json').notNull(),
  status: text('status').default('pending'), // pending | approved | rejected
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Research paper likes (anonymous, no auth required)
export const researchLikes = sqliteTable('research_likes', {
  id: text('id').primaryKey(),
  paperId: text('paper_id').notNull(),
  visitorId: text('visitor_id').notNull(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// Visitor login counts by country (for globe visualization)
export const loginsByCountry = sqliteTable('logins_by_country', {
  countryCode: text('country_code').primaryKey(), // ISO alpha-2
  count: integer('count').notNull().default(0),
});
