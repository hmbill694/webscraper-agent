import Agent from "./agent";
import GoogleSearcher from "./google-searcher";
import OpenAIClient from "./open-ai-client";
import { GOOGLE_SEARCH_GENERATOR_SYSTEM_PROMPT, QUESTION_PROCESSOR_AGENT_SYSTEM_PROMPT, RESEARCH_AGENT_SYSTEM_PROMPT, googleSearchGeneratorPrompt, questionProcessorAgentPrompt, researchAgentPrompt } from "./prompts";
import { questionProcessorResponseExtractor, researchAgentExtractor, searchQueryExtractor } from "./response-extractor";
import { Result } from "./result";
import WebScraper from "./web-scraper";

const apiKey = process.env.OPEN_AI_API_KEY ?? "";
const projectId = process.env.OPEN_AI_PROJECT_ID ?? "";
const orgId = process.env.OPEN_AI_ORG_ID ?? "";

const client = new OpenAIClient(apiKey, 0, orgId, projectId);

const currentUtcDateTime = new Date().toISOString();

const prompt = "How many seasons is the show that features Omni-man?";

const processor = new Agent(client, QUESTION_PROCESSOR_AGENT_SYSTEM_PROMPT)

const processorResult = await Result.fromAsync(() =>
  processor.run(questionProcessorAgentPrompt(prompt, currentUtcDateTime))
)

const questionChain = processorResult
  .map(questionProcessorResponseExtractor)
  .getOrThrow()


const searchQueryGenerator = new Agent(client, GOOGLE_SEARCH_GENERATOR_SYSTEM_PROMPT)

const googleSearcher = new GoogleSearcher(process.env.SERPER_API_KEY ?? "")

const webScraper = new WebScraper()

const researchAgent = new Agent(client, RESEARCH_AGENT_SYSTEM_PROMPT)

let knownInfo: { question: string, answer: string, sources: string[] }[] = []

for (const { question, dependsOn } of questionChain.subQuestions) {
  const googleQueryResult = await Result.fromAsync(() =>
    searchQueryGenerator.run(googleSearchGeneratorPrompt({ userQuery: question, knownInfo, currentDateTime: currentUtcDateTime }))
  )

  const { searchQuery } = googleQueryResult
    .map(searchQueryExtractor)
    .getOrThrow()

  const googleSearchResult = await Result.fromAsync(() => googleSearcher.searchGoogle(searchQuery))

  const researchCandiates = googleSearchResult.getOrThrow()

  for (const { link } of researchCandiates.slice(0, 3)) {
    const searchResult = await webScraper.scrapeUrl(link)

    if (searchResult.isError()) {
      continue;
    }

    const researchAgentResult = await Result.fromAsync(() => researchAgent.run(researchAgentPrompt({ question, url: link, text: searchResult.getOrThrow() })))

    const { foundAnswer, answer, sources } = researchAgentResult.map(researchAgentExtractor).getOrThrow()

    if (foundAnswer === "yes") {
      knownInfo.push({ question, answer, sources })
      break;
    }
  }
}

console.log(knownInfo)
