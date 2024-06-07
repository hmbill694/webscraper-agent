import axios from 'axios';
import type { GoogleSearchAgentResponse } from './response-extractor';

const SEPER_SEARCH_URL = "https://google.serper.dev/search";

type SearchResult = { title: string, link: string, snippet: string, date?: string }

export default class GoogleSearcher {
  headers: { 'X-API-KEY': string; 'Content-Type': string; };

  constructor(serperApiKey: string) {
    this.headers = {
      'X-API-KEY': serperApiKey,
      'Content-Type': 'application/json'
    };
  }


  async searchGoogle(searchQuestion: string): Promise<SearchResult[]> {

    const payload = JSON.stringify({
      q: searchQuestion
    });

    try {
      const response = await axios.post(SEPER_SEARCH_URL, payload, {
        headers: this.headers,
        timeout: 5000
      });

      const body = response.data;


      return body.organic.map(({ title, link, snippet, date }) => ({ title, link, snippet, date } as SearchResult));
    } catch (error) {
      console.error("Error searching Google:", error);
      throw new Error("Failed to search Google");
    }
  }
}