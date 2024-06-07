import type { ProtoClient } from "./open-ai-client";

export default class Agent {
  private client: ProtoClient;
  private systemPrompt: string;
  private verbose: boolean;

  constructor(client: ProtoClient, systemPrompt: string, verbose: boolean = false) {
    this.client = client;
    this.systemPrompt = systemPrompt;
    this.verbose = verbose;
  }

  async run(query: string): Promise<string> {
    if (this.verbose) {
      console.log(this.systemPrompt, "\n")
      console.log(query, "\n")
    }

    const response: string = await this.client.query(this.systemPrompt, query);

    if (this.verbose) {
      console.log(response, "\n");
    }

    return response;
  }
}