export function ApiErrorState({
  message = "데이터를 불러오지 못했습니다.",
}: {
  message?: string;
}) {
  return (
    <section className="simple-filter-panel" aria-live="polite">
      <p>{message}</p>
    </section>
  );
}

export function ApiEmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <section className="simple-filter-panel" aria-live="polite">
      <p>{message}</p>
    </section>
  );
}
