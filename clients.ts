import OpenAIClient from "./open-ai-client";

const apiKey = process.env.OPEN_AI_API_KEY ?? "";
const projectId = process.env.OPEN_AI_PROJECT_ID ?? "";
const orgId = process.env.OPEN_AI_ORG_ID ?? "";

export const openAIClient = new OpenAIClient(apiKey, 0, orgId, projectId);