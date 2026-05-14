import { formatDuration } from "../../utils/formatters";

type ResultAnswerCardProps = {
  title: string;
  subtitle: string;
  content: string;
  audioLabel: string;
  durationSeconds?: number;
};

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  );
}

export function ResultAnswerCard({
  title,
  subtitle,
  content,
  audioLabel,
  durationSeconds,
}: ResultAnswerCardProps) {
  return (
    <article className="result-answer-card">
      <h2>
        {title} <span>({subtitle})</span>
      </h2>
      <p>
        {content.split("\n").map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </p>
      <div className="result-audio-row">
        <button type="button">
          <PlayIcon />
          {audioLabel}
        </button>
        <time>{formatDuration(durationSeconds ?? 0)}</time>
      </div>
    </article>
  );
}
