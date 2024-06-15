import GoogleSearcher from "./google-searcher";
import WebScraper from "./web-scraper";

export const webScraper = new WebScraper()

export const googleSearcher = new GoogleSearcher(process.env.SERPER_API_KEY ?? "")