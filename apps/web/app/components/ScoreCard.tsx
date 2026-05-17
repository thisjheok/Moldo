import type { ScoreItem } from "@moldo/types";

export function ScoreCard({ score }: { score: ScoreItem }) {
  return (
    <article className="result-score-card">
      <h2>{score.label}</h2>
      <strong>{score.score}</strong>
      <span>/{score.maxScore}</span>
    </article>
  );
}
