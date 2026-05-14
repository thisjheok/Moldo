type FeedbackCardProps = {
  title: string;
  tone: "good" | "improve";
  items: string[];
};

export function FeedbackCard({ title, tone, items }: FeedbackCardProps) {
  return (
    <article className={`result-feedback-card ${tone}`}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
