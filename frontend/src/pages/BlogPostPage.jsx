import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../api/client';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getBlogPost(slug)
      .then(res => setPost(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const parseTags = (tags) => {
    if (!tags) return [];
    try { return JSON.parse(tags); } catch { return []; }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-3xl))' }}>
        <div className="container">
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 20, width: 200, marginBottom: 32 }} />
            <div className="skeleton" style={{ height: 300 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-3xl))', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-lg)' }}>Post Not Found</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/blog" className="btn btn-primary">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-3xl))' }}>
      <div className="container">
        <article style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 'var(--space-4xl)' }}>
          <Link to="/blog" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 'var(--space-xl)' }}>
            ← Back to Blog
          </Link>

          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-lg)' }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-sm)', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            {post.published_at && (
              <span>{new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-2xl)' }}>
            {parseTags(post.tags).map((tag, i) => (
              <span key={i} className="badge badge-accent">{tag}</span>
            ))}
          </div>

          <div className="blog-post-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
