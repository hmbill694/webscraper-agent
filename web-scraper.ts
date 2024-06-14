import { chromium, type Browser } from 'playwright';
import * as cheerio from 'cheerio';
import { Result } from './result';

export default class WebScraper {
  private async run(browser: Browser, url: string): Promise<string> {
    const page = await browser.newPage();

    const res = await page.goto(url, { timeout: 5000 });

    const status = res?.status() ?? 0
    if (!status || status !== 200) {
      throw new Error(`Recieved non 200 status code (${status}) when requesting ${url}`)
    }

    const pageHtml = await page.innerHTML('body')

    return cleanHTML(pageHtml);
  }

  async scrapeUrl(url: string): Promise<Result<string>> {
    const playwright = await chromium.launch();
    try {
      const html = await this.run(playwright, url)
      return Result.Ok(html)
    } catch (e) {
      return Result.Err(`${e}`)
    } finally {
      await playwright.close();
    }

  }
}

function cleanHTML(html: string): string {
  // Load the HTML into cheerio
  const $ = cheerio.load(html);

  // Remove all script, style, and non-informative elements
  $('script, style, iframe, img, video, nav, footer, header, aside').remove();
  // Remove comments
  $('*')
    .contents()
    .filter(function () {
      return this.type === 'comment';
    })
    .remove();

  // Decode HTML entities using Cheerio
  $('body').html($('body').html() || '').html();

  // Remove redundant tags (e.g., empty divs or spans)
  $('div:empty, span:empty').remove();

  // Extract main content: This is a simple example; you might need more sophisticated logic
  const mainContent = $('body')
    .contents()
    .map(function () {
      return $(this).prop("innerText")
    })
    .get()
    .join('')

  // Normalize whitespace
  const normalizedContent = (mainContent || '')
    .replace(/\s+/g, ' ') // Replace multiple whitespace with a single space
    .trim()
    .slice(0, 4000);

  return normalizedContent;
}