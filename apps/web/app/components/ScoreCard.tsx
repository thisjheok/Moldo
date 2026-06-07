type ScoreCardProps = {
  label: string;
  score: number;
  maxScore: number;
};

export function ScoreCard({ label, score, maxScore }: ScoreCardProps) {
  return (
    <article className="result-score-card">
      <h2>{label}</h2>
      <strong>{score}</strong>
      <span>/{maxScore}</span>
    </article>
  );
}
