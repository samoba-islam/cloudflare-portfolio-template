import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';

const TITLES = [
  'Android Developer',
  'Backend Developer',
  'Open Source Contributor',
  'AI Enthusiast',
  'Full Stack Developer',
];

export default function Hero() {
  const [profile, setProfile] = useState(null);
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.getProfile().then(res => setProfile(res.data)).catch(() => {});
  }, []);

  // Typing effect
  useEffect(() => {
    const currentTitle = TITLES[titleIndex];
    const speed = isDeleting ? 50 : 100;

    timerRef.current = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentTitle.slice(0, displayText.length + 1));
        if (displayText.length === currentTitle.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentTitle.slice(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setTitleIndex((titleIndex + 1) % TITLES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timerRef.current);
  }, [displayText, isDeleting, titleIndex]);

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="hero-greeting">👋 Hello, I'm</p>
        <h1 className="hero-name">{profile?.name || 'Shawon Hossain Samoba'}</h1>
        <p className="hero-title">
          I'm a <span className="hero-typing">{displayText}</span>
        </p>
        <p className="hero-description">
          {profile?.tagline || 'Building innovative Android & backend solutions since 2014. 10+ years of experience, 100+ published apps, and 3 open source libraries.'}
        </p>
        <div className="hero-buttons">
          <a href="#projects" className="btn btn-primary btn-lg" onClick={e => {
            e.preventDefault();
            document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View My Work
          </a>
          <a href="#contact" className="btn btn-secondary btn-lg" onClick={e => {
            e.preventDefault();
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Get In Touch
          </a>
          {profile?.cv_url && (
            <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download CV
            </a>
          )}
        </div>

        <div className="hero-social">
          {profile?.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          )}
          {profile?.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          )}
          {profile?.facebook_url && (
            <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="social-link" title="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
