import { getServerIsAuthenticated } from "../../lib/api/server";
import { ResultPageClient } from "./ResultPageClient";

const DEFAULT_RESULT_ID = "result-speaking-mock-1-20240514";

type ResultPageProps = {
  searchParams?: Promise<{
    resultId?: string;
  }>;
};

export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams;
  const resultId = params?.resultId ?? DEFAULT_RESULT_ID;
  const isAuthenticated = await getServerIsAuthenticated();

  return <ResultPageClient initialIsAuthenticated={isAuthenticated} resultId={resultId} />;
}
