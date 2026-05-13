import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";

type ResultIconName = "arrow" | "play";

const scoreCards = [
  { label: "질문 정확성", score: 84 },
  { label: "전달 정확성", score: 80 },
  { label: "유창성", score: 78 },
  { label: "문법 구조", score: 86 },
];

function ResultIcon({ name }: { name: ResultIconName }) {
  if (name === "arrow") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  );
}

export default function ResultPage() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="result-main" aria-labelledby="result-title">
        <section className="result-score-section">
          <div className="result-exam-heading">
            <span>모의고사 결과</span>
            <h1 id="result-title">모의고사 A</h1>
            <p>2024-05-14 14:20 응시</p>
          </div>

          <div className="result-total-score" aria-label="총점">
            <strong>82점</strong>
            <span>/ 100</span>
          </div>

          <div className="result-score-grid" aria-label="세부 평가 점수">
            {scoreCards.map((card) => (
              <article className="result-score-card" key={card.label}>
                <h2>{card.label}</h2>
                <strong>{card.score}</strong>
                <span>/100</span>
              </article>
            ))}
          </div>
        </section>

        <section className="result-question-bar" aria-label="문항 정보">
          <p>
            <strong>문항 3.</strong> 당신의 스마트폰 사용 습관에 대해 설명하고, 바꾸고 싶은
            점이 있다면 말해보세요.
          </p>
          <Link href="/exam">
            다른 문항 보기 (3 / 15)
            <ResultIcon name="arrow" />
          </Link>
        </section>

        <section className="result-answer-grid" aria-label="답변 비교">
          <article className="result-answer-card">
            <h2>내 답변 <span>(전사 내용)</span></h2>
            <p>
              I use my smartphone a lot every day.
              <br />
              I check SNS and watch videos.
              <br />
              Sometimes it wastes my time.
              <br />I want to use it less.
            </p>
            <div className="result-audio-row">
              <button type="button">
                <ResultIcon name="play" />
                내 답변 듣기
              </button>
              <time>0:28</time>
            </div>
          </article>

          <article className="result-answer-card">
            <h2>이렇게 말하면 더 좋아요 <span>(모범 답변)</span></h2>
            <p>
              I use my smartphone a lot every day, <mark>especially</mark>
              <br />
              for SNS and watching videos. However, it
              <br />
              <mark>often wastes</mark> my time, so I want to reduce my
              <br />
              screen time and use it more productively.
            </p>
            <div className="result-audio-row">
              <button type="button">
                <ResultIcon name="play" />
                모범 답변 듣기
              </button>
              <time>0:31</time>
            </div>
          </article>
        </section>

        <section className="result-feedback-grid" aria-label="평가 피드백">
          <article className="result-feedback-card good">
            <h2>잘한 점</h2>
            <ul>
              <li>질문의 핵심 내용을 모두 포함했어요.</li>
              <li>간단한 문장으로 자신의 생각을 표현했어요.</li>
            </ul>
          </article>

          <article className="result-feedback-card improve">
            <h2>개선할 점</h2>
            <ul>
              <li>접속사(However, so 등)를 활용해 보세요.</li>
              <li>구체적인 예시를 추가하면 더 좋아요.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
