import { getServerIsAuthenticated } from "../../lib/api/server";
import { ResultPageClient } from "./ResultPageClient";

type ResultPageProps = {
  searchParams?: Promise<{
    resultId?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const resultId = params?.resultId ?? null;
  const isAuthenticated = await getServerIsAuthenticated();

  return <ResultPageClient initialIsAuthenticated={isAuthenticated} resultId={resultId} />;
}
