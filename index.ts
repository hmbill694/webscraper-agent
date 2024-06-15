import Agent from "./agent";
import { processor, researchAgent, searchQueryGenerator, summerizerAgent } from "./agents";
import GoogleSearcher from "./google-searcher";
import type { AccumlatedKnowledge } from "./modal";
import OpenAIClient from "./open-ai-client";
import {
  GOOGLE_SEARCH_GENERATOR_SYSTEM_PROMPT,
  QUESTION_PROCESSOR_AGENT_SYSTEM_PROMPT,
  RESEARCH_AGENT_SYSTEM_PROMPT,
  googleSearchGeneratorPrompt,
  questionProcessorAgentPrompt,
  researchAgentPrompt,
  summarizerPrompt
} from "./prompts";
import { questionProcessorResponseExtractor, researchAgentExtractor, searchQueryExtractor } from "./response-extractor";
import { Result } from "./result";
import { googleSearcher, webScraper } from "./tools";

const currentUtcDateTime = new Date().toISOString();

let prompt = "";
process.stdout.write("What is your question: ");
for await (const line of console) {
  prompt = line;
  break;
}

const processorResult = await Result.fromAsync(() =>
  processor.run(questionProcessorAgentPrompt(prompt, currentUtcDateTime))
)

const questionChain = processorResult
  .map(questionProcessorResponseExtractor)
  .getOrThrow()

let knownInfo: AccumlatedKnowledge[] = []
for (const { question } of questionChain.subQuestions) {
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

    const { foundAnswer, answer, source } = researchAgentResult.map(researchAgentExtractor).getOrThrow()

    if (foundAnswer === "yes") {
      knownInfo.push({ question, answer, source })
      break;
    }
  }
}

const finalResponse = await summerizerAgent.run(summarizerPrompt(prompt, knownInfo))


console.log(finalResponse)
