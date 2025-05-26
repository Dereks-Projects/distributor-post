// src/components/ArticleCard.jsx

function ArticleCard({ title, description, url, image, source, publishedAt }) {
  return (
    <div style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem", borderRadius: "8px" }}>
      {image && (
        <img
          src={image}
          alt={title}
          style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
        />
      )}
      <h2>{title}</h2>
      <div dangerouslySetInnerHTML={{ __html: description }} />
      <small>
        Source: {source?.name || "Unknown"} | {new Date(publishedAt).toLocaleString()}
      </small>
      <br />
      <a href={url} target="_blank" rel="noopener noreferrer">Read Full Article</a>
    </div>
  );
}

export default ArticleCard;
