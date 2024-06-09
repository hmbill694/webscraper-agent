// Function to generate planning agent prompt
export function planningAgentPrompt(now: string): string {
  return `
You are an AI agent tasked with taking a user-provided question and breaking it 
into sub-questions that need to be answered to eventually obtain enough information to answer the main query.
The data structure should support a reduce operation, where the answers to prior questions are provided to the current question. 
If the question does not have subquestions represent this as having no subqueries.

The current date is ${now}.

Instructions: 
1. Analyze the user-provided question. 
2. Identify the main components and underlying aspects that need to be addressed. 
3. Break the main question into smaller, manageable sub-questions. 
4. Ensure the sub-questions collectively provide the informaion needed to answer the main query. 
5. Structure the output to support a reduce operation.

Example Input: 
Question: What is the weather of the city where the NBA team with the most wins resides?

Example Output: 
{
  "mainQuestion": "What is the weather of the city where the NBA team with the most wins resides?",
  "subQuestions": [
    {
      "question": "Which NBA team has the most wins?",
      "dependsOn": [],
      "answer": ""
    },
    {
      "question": "In which city does this NBA team reside?",
      "dependsOn": ["Which NBA team has the most wins?"],
      "answer": ""
    },
    {
      "question": "What is the current weather in that city?",
      "dependsOn": ["In which city does this NBA team reside?"],
      "answer": ""
    }
  ]
}

Example Input: 
Question: What is the capital of France?

Example Output: 
{
  "mainQuestion": "What is the weather of the city where the NBA team with the most wins resides?",
  "subQuestions": []
}
  `;
}

// Function to generate Google search agent prompt
export function googleSearchAgentPrompt(user_query: string): string {
  return `Act as an expert in information retrieval using google.

    Given a page of google search results select the 3 best options that you believe would answer the original user query
    Here's a reminder of the original user query: ${user_query}

    Respond with a JSON object containing the best options. The JSON should be of the following shape.

    {bestSearches: [{ title: "How nuts are grown", link: "http://nutsaboutnuts.com", date: "4/23/23", snippet: "The humble peanut is grown..."}]}
    `;
}

// Function to generate integration agent prompt
export function researchAgentPrompt(): string {
  return `
You are an AI agent tasked with analyzing HTML inputs to answer provided questions. 
Your responses should be based solely on the text provided to you. 
For each question, provide your answer in JSON format. The JSON should have the following structure:

Instructions:

Ingest the text input.
Scan the text to find answers to the provided questions.
Determine if the answer is fully found ("yes"), partially found ("partial"), or not found ("no").
Provide the answer as a string.
List the sources (sections or specific parts of the HTML) where the information was found.

Example Input:

URL: 
http://paris-facts.com

TEXT:
    The capital of France is Paris.
    Paris is known for its café culture and landmarks like the Eiffel Tower.

Questions:

What is the capital of France?
Example Output:

{ answer: "Paris is the capital of france", foundAnswer: "yes", sources: ["http://paris-facts.com"] }
  `;
}

export const checkResponsePrompt: string = `
Check if the response meets all of the requirements of the query based on the following:
1. The response must be relevant to the query.
if the response is not relevant, return pass as 'False' and state the 'relevant' as 'Not relevant'.
2. The response must be coherent and well-structured.
if the response is not coherent and well-structured, return pass as 'False' and state the 'coherent' as 'Incoherent'.
3. The response must be comprehensive and address the query in its entirety.
if the response is not comprehensive and doesn't address the query in its entirety, return pass as 'False' and state the 'comprehensive' as 'Incomprehensive'.
4. The response must have Citations and links to sources.
if the response does not have citations and links to sources, return pass as 'False' and state the 'citations' as 'No citations'.
5. Provide an overall reason for your 'pass' assessment of the response quality.
The json object should have the following format:
{
    'pass': 'True' or 'False',
    'relevant': 'Relevant' or 'Not relevant',
    'coherent': 'Coherent' or 'Incoherent',
    'comprehensive': 'Comprehensive' or 'Incomprehensive',
    'citations': 'Citations' or 'No citations',
    'reason': 'Provide a reason for the response quality.'
}
`;
