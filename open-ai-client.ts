import axios, { type AxiosRequestHeaders } from "axios";
import { exponentialBackoff } from "./utils";

interface Message {
  role: string;
  content: string;
}

interface Payload {
  model: string;
  messages: Message[];
  stream: boolean;
  temperature: number;
}

interface Headers {
  'Content-Type': string;
  Authorization: string;
  'OpenAI-Organization': string;
  'OpenAI-Project': string;
}

export abstract class ProtoClient {
  constructor() { }

  abstract query(system_prompt: string, prompt: string): Promise<string>;
}

export default class OpenAIClient extends ProtoClient {
  private model: string;
  private api_key: string;
  private headers: Headers;
  private temperature: number;

  constructor(api_key: string, temperature: number, org_key: string, project_key: string) {
    super();
    this.model = 'gpt-3.5-turbo';
    this.api_key = api_key;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.api_key}`,
      'OpenAI-Organization': org_key,
      'OpenAI-Project': project_key
    };
    this.temperature = temperature;
  }

  async query(system_prompt: string, prompt: string): Promise<string> {
    const payload: Payload = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: system_prompt
        },
        {
          role: 'user',
          content: `${prompt}`
        }
      ],
      stream: false,
      temperature: this.temperature
    };

    try {

      const response = await exponentialBackoff(() => axios.post(
        'https://api.openai.com/v1/chat/completions',
        payload,
        { headers: this.headers as unknown as AxiosRequestHeaders }
      ), 3, 5000);

      const responseData = response.data;
      const llm_response: string = responseData.choices[0].message.content;

      return llm_response;

    } catch (error: unknown) {
      throw new Error(error.message);
    }
  }
}
