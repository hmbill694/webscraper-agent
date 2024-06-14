import { z } from "zod";


const subQuestionSchema = z.object({
  question: z.string(),
})

export type SubQuestion = z.TypeOf<typeof subQuestionSchema>

const questionProcessorSchema = z.object({
  subQuestions: z.array(subQuestionSchema)
})

export type QuestionProcessorResponse = z.TypeOf<typeof questionProcessorSchema>

const searchQuerySchema = z.object({ searchQuery: z.string() })

export type SearchQueryResponse = z.TypeOf<typeof searchQuerySchema>

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

const researchAgentResponseSchema = z.object({
  foundAnswer: z.enum(["yes", "no", "partial"]),
  answer: z.string(),
  sources: z.array(z.string())
})

export type ResearchAgentResponse = z.TypeOf<typeof researchAgentResponseSchema>

const parseWithSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => (input: string) => {
  const res = JSON.parse(input)

  const { success, data, error } = schema.safeParse(res)

  if (!success) {
    throw Error(`${error}`)
  }

  return data;

}

export const researchAgentExtractor = parseWithSchema(researchAgentResponseSchema)
export const searchQueryExtractor = parseWithSchema(searchQuerySchema)
export const questionProcessorResponseExtractor = parseWithSchema(questionProcessorSchema)