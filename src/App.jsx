import { useEffect, useState } from 'react';
import ArticleCard from './components/ArticleCard';
import './App.css';
import WineQuiz from './components/WineQuiz';
import logoIcon from './assets/logo-icon.svg';

function App() {
  const [articles, setArticles] = useState([]);
  const [vinepairArticles, setVinepairArticles] = useState([]);
  const [substackArticles, setSubstackArticles] = useState([]);
  const [educationArticles, setEducationArticles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  function decodeHtmlEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

  function extractImageFromDescription(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const img = div.querySelector("img");
    return img?.src || null;
  }

  useEffect(() => {
    const stored = localStorage.getItem("gnews-articles");
    const lastFetch = localStorage.getItem("gnews-lastFetch");
    const now = Date.now();

    if (stored && lastFetch && now - parseInt(lastFetch, 10) < 24 * 60 * 60 * 1000) {
      setArticles(JSON.parse(stored));
    } else {
      const fetchNews = async () => {
        try {
          const query = "wine+beer+cocktails+restaurants";
          const response = await fetch(
            `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&token=73de993196680bf03a21493b1754c9d9`
          );
          const data = await response.json();
          if (Array.isArray(data.articles)) {
            const sliced = data.articles.slice(0, 4);
            setArticles(sliced);
            localStorage.setItem("gnews-articles", JSON.stringify(sliced));
            localStorage.setItem("gnews-lastFetch", now.toString());
          }
        } catch (error) {
          console.error('Error fetching news:', error);
        }
      };
      fetchNews();
    }
  }, []);

  useEffect(() => {
    const fetchRSS = async () => {
      try {
        const vinepair = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://vinepair.com/feed/');
        const vineData = await vinepair.json();
        const vineItems = (vineData.items || []).slice(0, 4).map(item => ({
          title: decodeHtmlEntities(item.title),
          description: decodeHtmlEntities(item.description),
          url: item.link,
          image: item.thumbnail || 'https://placehold.co/600x300?text=VinePair',
          source: { name: 'VinePair' },
          publishedAt: item.pubDate,
        }));
        setVinepairArticles(vineItems);
      } catch (error) {
        console.error('Error fetching RSS feed:', error);
      }
    };
    fetchRSS();
  }, []);

  useEffect(() => {
    const fetchSubstack = async () => {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://distributorpost.substack.com/feed');
        const data = await response.json();
        if (Array.isArray(data.items)) {
          const simplified = data.items.map(item => {
            const fallbackImg = extractImageFromDescription(item.description);
            return {
              title: decodeHtmlEntities(item.title),
              description: item.description,
              url: item.link,
              image: item.thumbnail || fallbackImg || null,
              source: { name: 'Distributor Post' },
              publishedAt: item.pubDate,
            };
          });
          setSubstackArticles(simplified.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching Substack feed:', error);
      }
    };
    fetchSubstack();
  }, []);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://derekengles.substack.com/feed');
        const data = await response.json();
        if (Array.isArray(data.items)) {
          const simplified = data.items.map(item => ({
            title: decodeHtmlEntities(item.title),
            description: item.description,
            url: item.link,
            image: item.thumbnail || extractImageFromDescription(item.description) || undefined,
            source: { name: 'Derek Engles (Substack)' },
            publishedAt: item.pubDate,
          }));
          setEducationArticles(simplified.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching Education feed:', error);
      }
    };
    fetchEducation();
  }, []);

  const renderSection = (id, title, data) => (
    <section>
      <h2 id={id}>{title}</h2>
      {data.length > 0 && (
        <>
          <div className="featured-container">
            <ArticleCard {...data[0]} />
          </div>
          <div className="article-grid">
            {data.slice(1, 4).map((article, index) => (
              <ArticleCard key={`${id}-${index}`} {...article} />
            ))}
          </div>
        </>
      )}
    </section>
  );

  return (
    <>
      <header className="mobile-header">
        <img
          src={logoIcon}
          alt="Distributor Post Logo"
          className="desktop-icon hide-on-mobile"
        />
        <span className="hamburger hide-on-desktop" onClick={toggleMenu}>☰</span>
        <span className="mobile-title hide-on-desktop">Distributor Post</span>
        <span className="desktop-title hide-on-mobile">Distributor Post</span>
        <span className="search-icon" onClick={() => setSearchOpen(prev => !prev)}>🔍</span>
      </header>

      {searchOpen && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search articles..."
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {menuOpen && (
        <nav className="mobile-nav">
          <a onClick={() => scrollToSection('original')}>Industry Analysis</a>
          <a onClick={() => scrollToSection('trending')}>Trending Headlines</a>
          <a onClick={() => scrollToSection('industry')}>Industry Sources</a>
          <a onClick={() => scrollToSection('education')}>Beverage Education</a>
        </nav>
      )}

      <div className="app-container">
        <header className="site-header">
          <p className="site-subtitle">The #1 Resource for Beverage Industry Professionals</p>
        </header>

        <nav className="site-nav">
          <a onClick={() => scrollToSection('original')}>Industry Analysis</a>
          <a onClick={() => scrollToSection('trending')}>Trending Headlines</a>
          <a onClick={() => scrollToSection('industry')}>Industry Sources</a>
          <a onClick={() => scrollToSection('education')}>Beverage Education</a>
        </nav>

        {renderSection("original", "In Depth Analysis", substackArticles)}
        {renderSection("trending", "Trending Headlines", articles)}
        {renderSection("industry", "From Industry Sources", vinepairArticles)}

        <section>
          <h2 id="education">Beverage Education</h2>
          {educationArticles.length > 0 && (
            <>
              <div className="featured-container">
                <ArticleCard {...educationArticles[0]} />
              </div>
              <div className="article-grid">
                {educationArticles.slice(1, 4).map((article, index) => (
                  <ArticleCard key={`education-${index}`} {...article} />
                ))}
              </div>
            </>
          )}
          <div className="quiz-wrapper">
            <WineQuiz />
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <img src="/footer-logo.png" alt="Footer Logo" className="footer-logo" />
        <p className="footer-tagline">Insight for Beverage Professionals</p>
        <p>&copy; {new Date().getFullYear()} Distributor Post. All rights reserved.</p>
        <div className="footer-links">
          <a href="https://www.linkedin.com/company/distributorpost" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:derek@somm.site">Contact Us</a>
          <a href="https://www.somm.site" target="_blank" rel="noopener noreferrer">Learn More</a>
        </div>
      </footer>
    </>
  );
}

export default App;
