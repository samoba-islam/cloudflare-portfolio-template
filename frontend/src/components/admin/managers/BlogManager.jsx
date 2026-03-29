import api from '../../../api/client';
import CrudManager from '../CrudManager';

export default function BlogManager() {
  return (
    <CrudManager
      title="Blog Posts"
      fetchFn={() => api.getBlogPosts({ all: 'true', limit: 100 }).then(res => ({ data: res.data?.posts || [] }))}
      createFn={(data) => api.createBlogPost(data)}
      updateFn={(id, data) => api.updateBlogPost(id, data)}
      deleteFn={(id) => api.deleteBlogPost(id)}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        { key: 'is_published', label: 'Status', render: v => v ? (
          <span className="badge badge-success">Published</span>
        ) : (
          <span className="badge badge-warning">Draft</span>
        )},
        { key: 'published_at', label: 'Published', render: v => v ? new Date(v).toLocaleDateString() : '—' },
      ]}
      formFields={[
        { key: 'title', label: 'Title', required: true, placeholder: 'My Blog Post Title' },
        { key: 'slug', label: 'Slug (auto-generated if empty)', placeholder: 'my-blog-post-title' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, placeholder: 'A brief summary of the post...' },
        { key: 'content', label: 'Content (Markdown)', required: true, type: 'textarea', rows: 12, placeholder: '# My Post\n\nWrite your blog post in Markdown...' },
        { key: 'tags', label: 'Tags (comma separated)', type: 'tags', placeholder: 'React, Tutorial, Web Dev' },
        { key: 'cover_image_url', label: 'Cover Image URL', placeholder: 'https://...' },
        { key: 'is_published', label: 'Published', type: 'checkbox', checkboxLabel: 'Publish this post' },
      ]}
    />
  );
}
