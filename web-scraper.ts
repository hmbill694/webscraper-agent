import { chromium, type Browser } from 'playwright';
import { Err, Ok, type Result } from './utils';
import * as cheerio from 'cheerio';

export default class WebScraper {
  async run(browser: Browser, url: string): Promise<string> {
    const page = await browser.newPage();

    const res = await page.goto(url, { timeout: 5000 });

    const status = res?.status() ?? 0
    if (status !== 200) {
      throw new Error(`Recieved non 200 status code (${status}) when requesting ${url}`)
    }

    const pageHtml = await page.innerHTML('body')

    return cleanHTML(pageHtml).slice(0, 5000);
  }

  async scrapeUrl(url: string): Promise<Result<string>> {
    console.log(`Web scraper calling: ${url}`)
    const playwright = await chromium.launch();
    try {
      const html = await this.run(playwright, url)
      return Ok(html);
    } catch (e) {
      return Err(`${e}`)
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

  // Decode HTML entities
  $('body').html(($('body').html() || '').replace(/&[a-z]+;/g, (entity) => {
    const span = document.createElement('span');
    span.innerHTML = entity;
    return span.innerText;
  }));

  // Extract main content: This is a simple example; you might need a more sophisticated logic
  const mainContent = $('article').length ? $('article').html() : $('body').html();

  // Normalize whitespace
  const normalizedContent = (mainContent || '')
    .replace(/\s+/g, ' ') // Replace multiple whitespace with a single space
    .trim();

  // Remove redundant tags (e.g., empty divs or spans)
  $('div:empty, span:empty').remove();

  // Return the cleaned and optimized HTML
  return normalizedContent;
}