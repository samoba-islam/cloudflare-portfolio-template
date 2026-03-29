-- ============================================================
-- Portfolio — Example Seed Data
-- ============================================================

-- Admin user (password: "admin123" — CHANGE THIS)
-- You can generate a custom hash by referencing the included utils/password.ts
INSERT OR IGNORE INTO users (email, password_hash, name) VALUES
('admin@example.com', '8d64a8414e5801f2a01e7a68ce21d98e:b87d3e51b9f5216508d85c8c278134892586c05b7b1f279423902f93cf795c1d', 'Admin User');

-- Profile
INSERT OR REPLACE INTO profile (id, name, title, bio, tagline, email, location, github_url, linkedin_url, website_url) VALUES
(1,
 'John Doe',
 'Full-Stack Developer | Open Source Enthusiast',
 'Hello! I am a software engineer focused on building robust and scalable applications. I have experience in a variety of modern tech stacks and thrive on solving complex architectural problems.',
 'Crafting elegant backend and frontend solutions',
 'admin@example.com',
 'San Francisco, CA',
 'https://github.com/example',
 'https://linkedin.com/in/example',
 'https://example.com'
);

-- Work Experience
INSERT INTO experience (company, role, start_date, end_date, is_current, description, tech_stack, sort_order) VALUES
('TechCorp', 'Senior Developer', '2022-01', NULL, 1,
 'Leading technical projects and mentoring junior engineers while driving core product capabilities.',
 '["React", "Node.js", "Cloudflare"]', 1);

-- Education
INSERT INTO education (institution, degree, field, start_date, end_date, result, description, sort_order) VALUES
('State University', 'Bachelor of Science', 'Computer Science', '2016-01', '2020-12',
 'GPA: 3.8/4.00',
 'Graduated with honors focusing on distributed systems and software architecture.', 1);

-- Projects
INSERT INTO projects (title, description, tech_stack, live_url, github_url, is_featured, sort_order) VALUES
('Open Source CLI tool', 'A fast command line interface built for developers to scaffold resources automatically.',
 '["Go", "CLI"]',
 NULL, 'https://github.com/example/cli', 1, 1);

-- Skills
INSERT INTO skills (name, category, level, sort_order) VALUES
('JavaScript', 'Languages', 'expert', 1),
('React', 'Frameworks', 'expert', 2),
('SQL', 'Databases', 'expert', 3);
