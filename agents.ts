import Agent from "./agent"
import { openAIClient } from "./clients"
import {
  QUESTION_PROCESSOR_AGENT_SYSTEM_PROMPT,
  RESEARCH_AGENT_SYSTEM_PROMPT,
  GOOGLE_SEARCH_GENERATOR_SYSTEM_PROMPT,
  SUMMARIZER_AGENT_SYSTEM_PROMPT
} from "./prompts"

export const processor = new Agent(openAIClient, QUESTION_PROCESSOR_AGENT_SYSTEM_PROMPT)

export const researchAgent = new Agent(openAIClient, RESEARCH_AGENT_SYSTEM_PROMPT)

export const searchQueryGenerator = new Agent(openAIClient, GOOGLE_SEARCH_GENERATOR_SYSTEM_PROMPT)

export const summerizerAgent = new Agent(openAIClient, SUMMARIZER_AGENT_SYSTEM_PROMPT)