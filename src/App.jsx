import { useEffect, useState } from 'react';
import ArticleCard from './components/ArticleCard';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [vinepairArticles, setVinepairArticles] = useState([]);
  const [beverageDailyArticles, setBeverageDailyArticles] = useState([]);
  const [substackArticles, setSubstackArticles] = useState([]);
  const [educationArticles, setEducationArticles] = useState([]);

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
        const beverageDaily = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.beveragedaily.com/rss');

        const vineData = await vinepair.json();
        const bevData = await beverageDaily.json();

        const vineItems = (vineData.items || []).slice(0, 4).map(item => ({
          title: decodeHtmlEntities(item.title),
          description: decodeHtmlEntities(item.description),
          url: item.link,
          image: item.thumbnail || 'https://via.placeholder.com/600x300.png?text=VinePair',
          source: { name: 'VinePair' },
          publishedAt: item.pubDate,
        }));

        const bevItems = (bevData.items || []).slice(0, 4).map(item => ({
          title: decodeHtmlEntities(item.title),
          description: decodeHtmlEntities(item.description),
          url: item.link,
          image: item.thumbnail || 'https://via.placeholder.com/600x300.png?text=Beverage+Daily',
          source: { name: 'BeverageDaily' },
          publishedAt: item.pubDate,
        }));

        setVinepairArticles(vineItems);
        setBeverageDailyArticles(bevItems);
      } catch (error) {
        console.error('Error fetching RSS feeds:', error);
      }
    };
    fetchRSS();
  }, []);

  useEffect(() => {
    const fetchSubstack = async () => {
      try {
        const response = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https://distributorpost.substack.com/feed'
        );
        const data = await response.json();
        if (Array.isArray(data.items)) {
          const simplified = data.items.map(item => ({
            title: decodeHtmlEntities(item.title),
            description: item.description,
            url: item.link,
            image: item.thumbnail || 'https://via.placeholder.com/600x300.png?text=Distributor+Post',
            source: { name: 'Distributor Post' },
            publishedAt: item.pubDate,
          }));
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
        const response = await fetch(
          'https://api.rss2json.com/v1/api.json?rss_url=https://derekengles.substack.com/feed'
        );
        const data = await response.json();
        if (Array.isArray(data.items)) {
          const simplified = data.items.map(item => ({
            title: decodeHtmlEntities(item.title),
            description: item.description,
            url: item.link,
            image: item.thumbnail || 'https://via.placeholder.com/600x300.png?text=Education',
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

  function decodeHtmlEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  }

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
    <div className="app-container">
      <header className="site-header">
        <h1 className="site-title">Distributor Post</h1>
        <p className="site-subtitle">The #1 resource for beverage industry professionals.</p>
      </header>

      <nav className="site-nav">
        <a href="#original">Industry Analysis</a>
        <a href="#trending">Trending Headlines</a>
        <a href="#industry">Industry Sources</a>
        <a href="#education">Wine Education</a>
      </nav>

      {renderSection("original", "In Depth Analysis", substackArticles)}
      {renderSection("trending", "Trending Headlines", articles)}
      {renderSection("industry", "From Industry Sources", [...vinepairArticles, ...beverageDailyArticles])}
      {renderSection("education", "Wine Education", educationArticles)}

      <footer className="site-footer">
        <p className="footer-tagline">Insight for Beverage Professionals</p>
        <p>&copy; {new Date().getFullYear()} Distributor Post. All rights reserved.</p>
        <div className="footer-links">
          <a href="https://www.linkedin.com/company/distributorpost" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:derek@somm.site">Contact Us</a>
          <a href="https://distributorpost.substack.com/" target="_blank" rel="noopener noreferrer">More Education</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
