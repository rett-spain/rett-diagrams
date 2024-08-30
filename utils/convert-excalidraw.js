const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load Excalidraw file(s) and convert
  const excalidrawFiles = fs.readdirSync('.').filter(file => file.endsWith('.excalidraw'));

  for (const file of excalidrawFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const data = JSON.parse(content);

    await page.goto('https://excalidraw.com');

    // Load drawing into Excalidraw
    await page.evaluate((data) => {
      window.localStorage.setItem('excalidraw', JSON.stringify(data));
      window.location.reload();
    }, data);

    await page.waitForTimeout(3000); // Wait for Excalidraw to load

    // Export as SVG
    const svgContent = await page.evaluate(() => {
      return window.ExcalidrawAPI.exportToSvg();
    });

    fs.writeFileSync(`${file.replace('.excalidraw', '')}.svg`, svgContent);

    // Export as PNG
    const pngContent = await page.screenshot();
    fs.writeFileSync(`${file.replace('.excalidraw', '')}.png`, pngContent);
  }

  await browser.close();
})();