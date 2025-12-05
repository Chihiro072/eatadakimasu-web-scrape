import { Actor } from 'apify';
import { chromium } from 'playwright';

await Actor.init();

const input = await Actor.getInput();
const keyword = input?.keyword ?? 'best food near me';
const limit = input?.limit ?? 10;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(keyword)}`, { waitUntil: 'networkidle' });

await page.waitForTimeout(4000);

const results = new Set();

while (results.size < limit) {

    const data = await page.$$eval('.Nv2PK', els =>
        els.map(el => {
            return {
                name: el.querySelector('.qBF1Pd')?.textContent ?? null,
                rating: el.querySelector('.MW4etd')?.textContent ?? null,
                reviews: el.querySelector('.UY7F9')?.textContent ?? null,
                price: el.querySelector('.RANLX')?.textContent ?? null,
                category: el.querySelector('.W4Efsd')?.textContent ?? null
            };
        })
    );

    for (const d of data) results.add(d);

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(1500);
}

await Actor.pushData([...results].slice(0, limit));

await browser.close();
await Actor.exit();
