import Agent from "./agent";
import GoogleSearcher from "./google-searcher";
import OpenAIClient from "./open-ai-client";
import { googleSearchAgentPrompt, planningAgentPrompt, researchAgentPrompt } from "./prompts";
import { googleSearchAgentExtractor, planningAgentResponseExtractor, researchAgentExtractor, type PlanningAgentResponse, type PlanningAgentSubQuestion } from "./response-extractor";
import { Err, Ok, getOrThrow } from "./utils";
import WebScraper from "./web-scraper";

const apiKey = process.env.OPEN_AI_API_KEY ?? "";
const projectId = process.env.OPEN_AI_PROJECT_ID ?? "";
const orgId = process.env.OPEN_AI_ORG_ID ?? "";

const client = new OpenAIClient(apiKey, 0, orgId, projectId);

const currentUtcDateTime = new Date().toISOString();

const prompt = "How old is the current pope?";


try {
  const planningAgentResult = await planningPipeline(prompt, currentUtcDateTime)

  const planningAgentResponse = getOrThrow(planningAgentResult)

  const answerResult = await executePlan(planningAgentResponse)

} catch (e) {
  console.error(e);
}

async function planningPipeline(userQuestion: string, currentDateTimeString: string) {
  try {
    const planningAgent = new Agent(
      client,
      planningAgentPrompt(currentDateTimeString),
      true
    );

    return Ok(planningAgentResponseExtractor(await planningAgent.run(userQuestion)))

  } catch {
    return Err("Planning agent could not formulate plan to resolve this query")
  }
}


async function searchPipeline(searchQuery: string) {
  const googleSearchTool = new GoogleSearcher(process.env.SERPER_API_KEY ?? "");

  const googleSearches = await googleSearchTool.searchGoogle(searchQuery)

  const webScraper = new WebScraper()

  const researchAgent = new Agent(client, researchAgentPrompt(), true)

  if (googleSearches.length === 0) {
    throw Error("No search results provided")
  }

  const topThreeSearches = googleSearches.slice(0, 3)

  for (const { link } of topThreeSearches) {
    const researchContent = await webScraper.scrapeUrl(link)

    if (!researchContent.success) {
      console.log("An error has occured while researching, we could not scrape " + link)
      console.log(console.log(researchContent.error))
      continue
    }

    const researchAgentResponse = researchAgentExtractor(await researchAgent.run(`
        LINK: ${link}

        TEXT: 
        ${researchContent.data}
    `))

    if (researchAgentResponse.foundAnswer === "no" || researchAgentResponse.foundAnswer === "partial") {
      continue;
    }

    return Ok(researchAgentResponse)
  }

  throw Err("Was unable to find answer to question")
}

async function executePlan(plan: PlanningAgentResponse) {
  const questionTextToQuestionMap = plan.subQuestions.reduce((acc, question) => {
    acc[question.question] = question
    return acc
  }, {} as Record<string, PlanningAgentSubQuestion>)

  if (plan.subQuestions.length === 0) {
    const searchResult = await searchPipeline(plan.mainQuestion)
    const { answer } = getOrThrow(searchResult)
    return Ok(answer)
  }

  for (const [idx, subQuery] of plan.subQuestions.entries()) {
    const priorQuestions = (idx === 0 ? [] : plan.subQuestions.slice(0, idx))

    const priorAnsweredQuestions = priorQuestions
      .map(priorAnswer =>
        `QUESTION: ${priorAnswer.question}\n ANSWER: ${questionTextToQuestionMap[priorAnswer.question] ?? "No answer yet"}`
      ).join("")

    const searchResult = await searchPipeline(subQuery.question)
    const { answer: searchAnswer } = getOrThrow(searchResult)

    subQuery.answer = searchAnswer
  }

  console.log(plan.subQuestions.map(ele => `Question ${ele.question} \n Answer: ${ele.answer}`).join("\n"))

  // const formatPriorQuestionPrompts = ({ question, answer }: PlanningAgentSubQuestion) => `
  // QUESTION: 
  // ${question}

  // ANSWER:
  // ${answer}
  // `

}