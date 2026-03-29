// ============================================================
// Type definitions for Samoba Portfolio API
// ============================================================

export interface Env {
  DB: D1Database;
  R2?: R2Bucket;
  CACHE: KVNamespace;
  ASSETS?: Fetcher;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  CORS_ORIGIN: string;
}

// Database row types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  name: string;
  title: string;
  bio: string | null;
  tagline: string | null;
  profile_image_url: string | null;
  cv_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  start_date: string;
  end_date: string | null;
  is_current: number;
  description: string | null;
  tech_stack: string | null; // JSON array string
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string;
  end_date: string | null;
  is_current: number;
  result: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  tech_stack: string | null;
  images: string | null;
  live_url: string | null;
  github_url: string | null;
  playstore_url: string | null;
  is_featured: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  level: string;
  icon_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string | null;
  issuer: string | null;
  date: string | null;
  certificate_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  tags: string | null;
  is_published: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: number;
  created_at: string;
}

// API types
export interface JWTPayload {
  sub: number;
  email: string;
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Route handler type
export type RouteHandler = (
  request: Request,
  env: Env,
  params: Record<string, string>
) => Promise<Response>;
