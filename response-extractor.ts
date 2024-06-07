import { z } from "zod";


const subQuestionSchema = z.object({
  question: z.string(),
  dependsOn: z.array(z.string()),
  answer: z.string()
})

export type PlanningAgentSubQuestion = z.TypeOf<typeof subQuestionSchema>

const PlanningAgentResponseSchema = z.object({
  mainQuestion: z.string(),
  subQuestions: z.array(subQuestionSchema)
})

export type PlanningAgentResponse = z.TypeOf<typeof PlanningAgentResponseSchema>

export function planningAgentResponseExtractor(bestSearchJson: string): PlanningAgentResponse {
  const resJson = JSON.parse(bestSearchJson);

  const { success, data, error } = PlanningAgentResponseSchema.safeParse(resJson)

  if (!success) {
    throw Error(`${error}`)
  }

  return data;
}

const googleSearchResultSchema = z.object({
  title: z.string(),
  link: z.string(),
  snippet: z.string(),
  date: z.string()
})

export type GoogleSearchResultSchema = z.TypeOf<typeof googleSearchResultSchema>

const googleSearchAgentReponseSchema = z.object({
  bestSearches: z.array(googleSearchResultSchema)
})

export type GoogleSearchAgentResponse = z.TypeOf<typeof googleSearchAgentReponseSchema>

export function googleSearchAgentExtractor(bestSearchLinksJson: string): GoogleSearchAgentResponse {
  const resJson = JSON.parse(bestSearchLinksJson);
  const { success, data, error } = googleSearchAgentReponseSchema.safeParse(resJson)

  if (!success) {
    throw Error(`${error}`)
  }

  return data;
}

const researchAgentResponseSchema = z.object({
  foundAnswer: z.enum(["yes", "no", "partial"]),
  answer: z.string(),
  sources: z.array(z.string())
})

export type ResearchAgentResponse = z.TypeOf<typeof researchAgentResponseSchema>

export function researchAgentExtractor(researchResponse: string): ResearchAgentResponse {
  const resJson = JSON.parse(researchResponse)
  const { success, data, error } = researchAgentResponseSchema.safeParse(resJson)

  if (!success) {
    throw Error(`${error}`)
  }

  return data;
}