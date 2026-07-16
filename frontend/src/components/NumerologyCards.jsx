export default function NumerologyCards({ numerology }) {
  const { mulank, bhagyank, mulankInfo, bhagyankInfo } = numerology;
  return (
    <div className="card-grid">
      <div className="panel numerology-card">
        <div className="num">{mulank}</div>
        <div className="num-label">Mulank · Root Number</div>
        <div className="num-theme">Ruled by {mulankInfo.ruler} — {mulankInfo.theme}</div>
      </div>
      <div className="panel numerology-card">
        <div className="num">{bhagyank}</div>
        <div className="num-label">Bhagyank · Destiny Number</div>
        <div className="num-theme">Ruled by {bhagyankInfo.ruler} — {bhagyankInfo.theme}</div>
      </div>
    </div>
  );
}
