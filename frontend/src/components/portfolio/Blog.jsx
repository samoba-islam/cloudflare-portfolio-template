import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.getBlogPosts({ limit: 3 }).then(res => setPosts(res.data?.posts || [])).catch(() => {});
  }, []);

  if (posts.length === 0) return null;

  const parseTags = (tags) => {
    if (!tags) return [];
    try { return JSON.parse(tags); } catch { return []; }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <section className="section" id="blog">
      <div className="container">
        <h2 className="section-title">Blog</h2>
        <p className="section-subtitle">Thoughts, tutorials, and technical deep dives</p>

        <div className="blog-grid">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="glass-card blog-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <p className="blog-card-date">{formatDate(post.published_at)}</p>
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <div className="blog-card-tags">
                {parseTags(post.tags).map((tag, i) => (
                  <span key={i} className="badge badge-accent">{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {posts.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
            <Link to="/blog" className="btn btn-secondary">View All Posts →</Link>
          </div>
        )}
      </div>
    </section>
  );
}
