export default function CardSection({ title, content }) {
  return (
    <div className="panel reading-card">
      <h4>{title}</h4>
      <p style={{ marginBottom: 0 }}>{content}</p>
    </div>
  );
}
