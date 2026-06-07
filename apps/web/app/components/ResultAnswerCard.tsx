type ResultAnswerCardProps = {
  title: string;
  subtitle: string;
  content: string;
};

export function ResultAnswerCard({
  title,
  subtitle,
  content,
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
    </article>
  );
}
