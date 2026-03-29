import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <>
      {/* Background decorations */}
      <div className="bg-gradient-orbs" />
      <div className="bg-grid" />

      {/* Navigation */}
      <Navbar />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<><HomePage /><Footer /></>} />
        <Route path="/blog" element={<><BlogPage /><Footer /></>} />
        <Route path="/blog/:slug" element={<><BlogPostPage /><Footer /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}
