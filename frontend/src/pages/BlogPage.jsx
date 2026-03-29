import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    setLoading(true);
    api.getBlogPosts({ page, limit: 9, tag, search })
      .then(res => {
        setPosts(res.data?.posts || []);
        setPagination(res.data?.pagination || { page: 1, totalPages: 1 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, tag, search]);

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
    <div style={{ paddingTop: 'calc(var(--navbar-height) + var(--space-2xl))' }}>
      <div className="container">
        <div className="section">
          <h1 className="section-title">Blog</h1>
          <p className="section-subtitle">Technical articles, tutorials, and thoughts on software development</p>

          {/* Search */}
          <div style={{ maxWidth: 500, margin: '0 auto var(--space-2xl)', position: 'relative' }}>
            <input
              className="form-input"
              type="text"
              placeholder="Search posts..."
              defaultValue={search}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setSearchParams({ search: e.target.value, page: '1' });
                }
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>

          {loading ? (
            <div className="blog-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
                  <div className="skeleton" style={{ height: 16, width: 100, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 24, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 60, marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 20, width: 150 }} />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-3xl)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>📝 No posts found</p>
              <p>Check back soon for new content!</p>
            </div>
          ) : (
            <>
              <div className="blog-grid">
                {posts.map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="glass-card blog-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}>
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-2xl)' }}>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p}
                      className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSearchParams({ page: String(p), tag, search })}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
