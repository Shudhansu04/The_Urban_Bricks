import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <p className="about-eyebrow">About The Urban Bricks</p>
          <h1>Making property buying and selling feel simple again.</h1>
          <p className="about-lead">
            The Urban Bricks is a modern listing platform built to help buyers discover
            great homes and help owners showcase their properties with confidence. We keep
            things clear, local, and people-first so every step feels easier.
          </p>
        </div>
        <div className="about-hero-card">
          <h3>At a glance</h3>
          <ul>
            <li>Curated local listings with real photos</li>
            <li>Fast inquiries and direct owner contact</li>
            <li>Trusted reviews and transparent pricing</li>
          </ul>
        </div>
      </section>

      <section className="about-section">
        <h2>Our mission</h2>
        <p>
          We believe property decisions should feel confident, not confusing. Our mission is
          to simplify the process with clear details, responsive communication, and a platform
          that respects your time.
        </p>
      </section>

      <section className="about-section about-grid">
        <div className="about-card">
          <h3>Story behind the platform</h3>
          <p>
            The Urban Bricks started as a small neighborhood idea: create a single place
            where owners can list their homes without complicated steps and buyers can compare
            options without pressure.
          </p>
        </div>
        <div className="about-card">
          <h3>What we value</h3>
          <ul>
            <li>Transparency in every listing</li>
            <li>Quick, friendly support</li>
            <li>Local knowledge that matters</li>
          </ul>
        </div>
        <div className="about-card">
          <h3>What makes us different</h3>
          <p>
            We focus on clarity: clean layouts, real images, and accurate details. Buyers get
            trustworthy information; owners get tools to present their property at its best.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-owner">
          <div className="about-owner-avatar">
            <img src="/vite.svg" alt="Property Marketplace logo" className="about-owner-logo" />
          </div>
          <div>
            <h2>Meet the owner</h2>
            <p>
              Hi, I am Nitin — a property enthusiast who loves building helpful tools for
              real people. I created The Urban Bricks to make listing a home feel human,
              not overwhelming.
            </p>
            <p className="about-owner-meta">
              Based in India • Helping local communities connect since 2024
            </p>
          </div>
        </div>
      </section>

      <section className="about-section about-cta">
        <h2>Ready to explore?</h2>
        <p>
          Browse featured properties, save your favorites, or list your own property in just
          a few minutes.
        </p>
      </section>
    </div>
  );
}
