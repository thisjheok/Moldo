const instructionItems = [
  "Read each prompt carefully and use the preparation time before you answer.",
  "Record one final response per question. Live correction is not part of this session.",
  "Your feedback focuses on relevance, structure, fluency, and expression quality.",
];

const overviewItems = [
  { label: "Session format", value: "Exam-style speaking practice" },
  { label: "Evaluation", value: "AI transcript and response review" },
  { label: "Focus", value: "Content, structure, grammar, and delivery clarity" },
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow">Speaking Session</span>
          <h1>Start a focused speaking practice session</h1>
          <p className="hero-description">
            Practice in a timed exam-style flow, submit one final response per
            question, and receive structured feedback after the session.
          </p>
        </div>

        <div className="hero-panel">
          <div className="panel-header">
            <p className="panel-label">Today&apos;s session</p>
            <span className="status-pill">Ready to begin</span>
          </div>

          <dl className="overview-list">
            {overviewItems.map((item) => (
              <div className="overview-row" key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>

          <button className="primary-button" type="button">
            Start session
          </button>

          <p className="button-caption">
            You will review instructions first, then move into the first
            speaking prompt.
          </p>
        </div>
      </section>

      <section className="content-grid" aria-label="Session details">
        <article className="content-card">
          <div className="section-heading">
            <span className="section-kicker">Before you begin</span>
            <h2>What to expect</h2>
          </div>
          <p className="section-body">
            This session is designed for structured speaking practice rather
            than official score prediction. You will move through timed prompts
            and receive feedback after processing is complete.
          </p>
          <ul className="bullet-list">
            <li>Preparation time is provided before each response.</li>
            <li>Responses are uploaded after each question finishes.</li>
            <li>Original audio is used for processing and is not the core saved artifact.</li>
          </ul>
        </article>

        <article className="content-card">
          <div className="section-heading">
            <span className="section-kicker">Session guidance</span>
            <h2>Key instructions</h2>
          </div>
          <ul className="instruction-list">
            {instructionItems.map((item, index) => (
              <li key={item}>
                <span className="instruction-index">0{index + 1}</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
