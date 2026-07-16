export default function TagList({ tags = [] }) {
  if (!tags.length) return null;
  return (
    <div className="tag-list">
      {tags.map((t) => (
        <span key={t} className="tag-chip">{t}</span>
      ))}
    </div>
  );
}
