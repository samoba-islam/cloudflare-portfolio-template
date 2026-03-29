// ============================================================
// Samoba Portfolio — Worker Entry Point (API Router)
// ============================================================

import type { Env } from './types';
import { handleOptions, addCorsHeaders } from './middleware/cors';
import { jsonError, notFound, serverError } from './utils/response';
import { handleLogin, handleSetup, updateAdminCredentials } from './routes/auth';
import { getProfile, updateProfile } from './routes/profile';
import { listExperience, createExperience, updateExperience, deleteExperience } from './routes/experience';
import { listEducation, createEducation, updateEducation, deleteEducation } from './routes/education';
import { listProjects, createProject, updateProject, deleteProject } from './routes/projects';
import { listSkills, createSkill, updateSkill, deleteSkill } from './routes/skills';
import { listAchievements, createAchievement, updateAchievement, deleteAchievement } from './routes/achievements';
import { listBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost } from './routes/blog';
import { submitContact, listContacts, markContactRead, deleteContact } from './routes/contact';
import { uploadFile, getFile, deleteFile } from './routes/upload';
import { authenticate, isAuthError } from './middleware/auth';

// Simple route matching
interface Route {
  method: string;
  pattern: RegExp;
  handler: (request: Request, env: Env, params: Record<string, string>) => Promise<Response>;
}

const routes: Route[] = [
  // Auth
  { method: 'POST', pattern: /^\/api\/login$/, handler: (req, env) => handleLogin(req, env) },
  { method: 'POST', pattern: /^\/api\/setup$/, handler: (req, env) => handleSetup(req, env) },
  { method: 'PUT', pattern: /^\/api\/admin\/settings$/, handler: (req, env) => updateAdminCredentials(req, env) },

  // Profile
  { method: 'GET', pattern: /^\/api\/profile$/, handler: (req, env) => getProfile(req, env) },
  { method: 'PUT', pattern: /^\/api\/profile$/, handler: (req, env) => updateProfile(req, env) },

  // Experience
  { method: 'GET', pattern: /^\/api\/experience$/, handler: (req, env) => listExperience(req, env) },
  { method: 'POST', pattern: /^\/api\/experience$/, handler: (req, env) => createExperience(req, env) },
  { method: 'PUT', pattern: /^\/api\/experience\/(?<id>\d+)$/, handler: updateExperience },
  { method: 'DELETE', pattern: /^\/api\/experience\/(?<id>\d+)$/, handler: deleteExperience },

  // Education
  { method: 'GET', pattern: /^\/api\/education$/, handler: (req, env) => listEducation(req, env) },
  { method: 'POST', pattern: /^\/api\/education$/, handler: (req, env) => createEducation(req, env) },
  { method: 'PUT', pattern: /^\/api\/education\/(?<id>\d+)$/, handler: updateEducation },
  { method: 'DELETE', pattern: /^\/api\/education\/(?<id>\d+)$/, handler: deleteEducation },

  // Projects
  { method: 'GET', pattern: /^\/api\/projects$/, handler: (req, env) => listProjects(req, env) },
  { method: 'POST', pattern: /^\/api\/projects$/, handler: (req, env) => createProject(req, env) },
  { method: 'PUT', pattern: /^\/api\/projects\/(?<id>\d+)$/, handler: updateProject },
  { method: 'DELETE', pattern: /^\/api\/projects\/(?<id>\d+)$/, handler: deleteProject },

  // Skills
  { method: 'GET', pattern: /^\/api\/skills$/, handler: (req, env) => listSkills(req, env) },
  { method: 'POST', pattern: /^\/api\/skills$/, handler: (req, env) => createSkill(req, env) },
  { method: 'PUT', pattern: /^\/api\/skills\/(?<id>\d+)$/, handler: updateSkill },
  { method: 'DELETE', pattern: /^\/api\/skills\/(?<id>\d+)$/, handler: deleteSkill },

  // Achievements
  { method: 'GET', pattern: /^\/api\/achievements$/, handler: (req, env) => listAchievements(req, env) },
  { method: 'POST', pattern: /^\/api\/achievements$/, handler: (req, env) => createAchievement(req, env) },
  { method: 'PUT', pattern: /^\/api\/achievements\/(?<id>\d+)$/, handler: updateAchievement },
  { method: 'DELETE', pattern: /^\/api\/achievements\/(?<id>\d+)$/, handler: deleteAchievement },

  // Blog
  { method: 'GET', pattern: /^\/api\/blog$/, handler: (req, env) => listBlogPosts(req, env) },
  { method: 'GET', pattern: /^\/api\/blog\/(?<slug>[a-z0-9-]+)$/, handler: getBlogPost },
  { method: 'POST', pattern: /^\/api\/blog$/, handler: (req, env) => createBlogPost(req, env) },
  { method: 'PUT', pattern: /^\/api\/blog\/(?<id>\d+)$/, handler: updateBlogPost },
  { method: 'DELETE', pattern: /^\/api\/blog\/(?<id>\d+)$/, handler: deleteBlogPost },

  // Contact
  { method: 'POST', pattern: /^\/api\/contact$/, handler: (req, env) => submitContact(req, env) },
  { method: 'GET', pattern: /^\/api\/contacts$/, handler: (req, env) => listContacts(req, env) },
  { method: 'PUT', pattern: /^\/api\/contacts\/(?<id>\d+)\/read$/, handler: markContactRead },
  { method: 'DELETE', pattern: /^\/api\/contacts\/(?<id>\d+)$/, handler: deleteContact },

  // File uploads (R2)
  { method: 'POST', pattern: /^\/api\/upload$/, handler: (req, env) => uploadFile(req, env) },
  { method: 'GET', pattern: /^\/api\/files\/(?<key>.+)$/, handler: getFile },
  { method: 'DELETE', pattern: /^\/api\/upload\/(?<key>.+)$/, handler: deleteFile },

  // Dashboard stats
  {
    method: 'GET',
    pattern: /^\/api\/dashboard\/stats$/,
    handler: async (req, env) => {
      const auth = await authenticate(req, env);
      if (isAuthError(auth)) return auth;

      const [projects, blogs, contacts, skills, experience, education, achievements] = await Promise.all([
        env.DB.prepare('SELECT COUNT(*) as count FROM projects').first<{ count: number }>(),
        env.DB.prepare('SELECT COUNT(*) as count FROM blog_posts').first<{ count: number }>(),
        env.DB.prepare('SELECT COUNT(*) as count FROM contacts WHERE is_read = 0').first<{ count: number }>(),
        env.DB.prepare('SELECT COUNT(*) as count FROM skills').first<{ count: number }>(),
        env.DB.prepare('SELECT COUNT(*) as count FROM experience').first<{ count: number }>(),
        env.DB.prepare('SELECT COUNT(*) as count FROM education').first<{ count: number }>(),
        env.DB.prepare('SELECT COUNT(*) as count FROM achievements').first<{ count: number }>(),
      ]);

      const recentContacts = await env.DB.prepare(
        'SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5'
      ).all();

      return new Response(JSON.stringify({
        success: true,
        data: {
          stats: {
            projects: projects?.count || 0,
            blog_posts: blogs?.count || 0,
            unread_contacts: contacts?.count || 0,
            skills: skills?.count || 0,
            experience: experience?.count || 0,
            education: education?.count || 0,
            achievements: achievements?.count || 0,
          },
          recent_contacts: recentContacts.results,
        },
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    },
  },
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(env);
    }

    // Worker only receives /api/* requests (configured via run_worker_first in wrangler.toml)
    // Non-API routes are served by Cloudflare Assets with SPA fallback

    try {
      // Match route
      for (const route of routes) {
        if (request.method !== route.method) continue;

        const match = path.match(route.pattern);
        if (match) {
          const params = match.groups || {};
          const response = await route.handler(request, env, params);
          return addCorsHeaders(response, env);
        }
      }

      return addCorsHeaders(notFound('API endpoint not found'), env);
    } catch (error) {
      console.error('API Error:', error);
      return addCorsHeaders(
        serverError(error instanceof Error ? error.message : 'Internal server error'),
        env
      );
    }
  },
};
