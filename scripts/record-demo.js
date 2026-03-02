/**
 * Demo GIF Recording Script for Exception Management System
 *
 * What it does:
 *   Opens the dashboard in a browser, clicks through all screens,
 *   takes screenshots at each step, and combines them into a GIF.
 *
 * How to run:
 *   1. Start the dashboard:  npm start
 *   2. In another terminal:  node scripts/record-demo.js
 *
 * Output:
 *   public/demo.gif  (960 x 600, ready for README)
 *
 * Needs: puppeteer, gif-encoder-2, png-js
 *   npm install --save-dev puppeteer gif-encoder-2 png-js
 */

const puppeteer = require("puppeteer");
const GIFEncoder = require("gif-encoder-2");
const { PNG } = require("pngjs");
const fs = require("fs");
const path = require("path");

// --- Settings ---
const APP_URL = "http://localhost:3000/Exception_handling_portal";
const OUTPUT_PATH = path.join(__dirname, "..", "public", "demo.gif");
const WIDTH = 960;
const HEIGHT = 600;
const FRAME_DELAY = 1800; // 1.8 seconds per frame
const TEMP_DIR = path.join(__dirname, "..", "temp_screenshots");

// --- Steps to record ---
// Each step: what to do, then take a screenshot
const STEPS = [
  {
    name: "Dashboard Home",
    action: null, // just screenshot the home page
    wait: 2000
  },
  {
    name: "QC Failures",
    action: async (page) => {
      await page.click(".card-grid button:nth-child(1)");
    },
    wait: 2000
  },
  {
    name: "QC Failures - Today filter",
    action: async (page) => {
      const todayBtn = await page.$("button.toolbar-button");
      const buttons = await page.$$("button.toolbar-button");
      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent, btn);
        if (text.includes("Today")) {
          await btn.click();
          break;
        }
      }
    },
    wait: 1500
  },
  {
    name: "Back to Dashboard",
    action: async (page) => {
      await page.click(".back-button");
    },
    wait: 1500
  },
  {
    name: "Stock Mismatch",
    action: async (page) => {
      await page.click(".card-grid button:nth-child(2)");
    },
    wait: 2000
  },
  {
    name: "Back to Dashboard 2",
    action: async (page) => {
      await page.click(".back-button");
    },
    wait: 1500
  },
  {
    name: "Dispatch Issues",
    action: async (page) => {
      await page.click(".card-grid button:nth-child(3)");
    },
    wait: 2000
  },
  {
    name: "Back to Dashboard 3",
    action: async (page) => {
      await page.click(".back-button");
    },
    wait: 1500
  },
  {
    name: "Route Problems",
    action: async (page) => {
      await page.click(".card-grid button:nth-child(4)");
    },
    wait: 2000
  },
  {
    name: "Back to Dashboard 4",
    action: async (page) => {
      await page.click(".back-button");
    },
    wait: 1500
  },
  {
    name: "Operation Errors",
    action: async (page) => {
      await page.click(".card-grid button:nth-child(5)");
    },
    wait: 2000
  },
  {
    name: "Back to Dashboard 5",
    action: async (page) => {
      await page.click(".back-button");
    },
    wait: 1500
  },
  {
    name: "Daily Top 10",
    action: async (page) => {
      await page.click(".card-grid button:nth-child(6)");
    },
    wait: 2000
  },
  {
    name: "Focus Top 3",
    action: async (page) => {
      const buttons = await page.$$("button.toolbar-button");
      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent, btn);
        if (text.includes("Focus")) {
          await btn.click();
          break;
        }
      }
    },
    wait: 2000
  },
  {
    name: "Back to Dashboard Final",
    action: async (page) => {
      await page.click(".back-button");
    },
    wait: 2000
  }
];

async function takeScreenshots() {
  // Clean up temp folder
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  console.log("Opening browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [`--window-size=${WIDTH},${HEIGHT}`]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  console.log(`Going to ${APP_URL}...`);
  await page.goto(APP_URL, { waitUntil: "networkidle2", timeout: 30000 });

  // Wait for page to fully load
  await page.waitForSelector(".dashboard-root, .category-screen", { timeout: 10000 });

  const screenshotPaths = [];

  for (let i = 0; i < STEPS.length; i++) {
    const step = STEPS[i];
    console.log(`Step ${i + 1}/${STEPS.length}: ${step.name}`);

    // Do the action (click, etc.)
    if (step.action) {
      try {
        await step.action(page);
      } catch (err) {
        console.log(`  Warning: action failed - ${err.message}`);
      }
    }

    // Wait for content to load
    await new Promise((r) => setTimeout(r, step.wait));

    // Take screenshot
    const filePath = path.join(TEMP_DIR, `step_${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: filePath, type: "png" });
    screenshotPaths.push(filePath);
    console.log(`  Screenshot saved: ${filePath}`);
  }

  await browser.close();
  console.log("Browser closed.");
  return screenshotPaths;
}

async function createGif(screenshotPaths) {
  console.log("\nCreating GIF...");

  const encoder = new GIFEncoder(WIDTH, HEIGHT, "neuquant", false);
  const gifStream = fs.createWriteStream(OUTPUT_PATH);

  encoder.createReadStream().pipe(gifStream);
  encoder.start();
  encoder.setDelay(FRAME_DELAY);
  encoder.setRepeat(0); // loop forever
  encoder.setQuality(10);

  for (const filePath of screenshotPaths) {
    const pngData = fs.readFileSync(filePath);
    const png = PNG.sync.read(pngData);

    // GIF encoder needs raw RGBA pixel data
    encoder.addFrame(png.data);
    console.log(`  Added frame: ${path.basename(filePath)}`);
  }

  encoder.finish();

  return new Promise((resolve) => {
    gifStream.on("finish", () => {
      const size = fs.statSync(OUTPUT_PATH).size;
      console.log(`\nDone! GIF saved to: ${OUTPUT_PATH}`);
      console.log(`Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });
  });
}

async function cleanup() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true });
    console.log("Temp screenshots cleaned up.");
  }
}

async function main() {
  console.log("=== Dashboard Demo GIF Recorder ===\n");
  console.log(`Size: ${WIDTH}x${HEIGHT}`);
  console.log(`Frame delay: ${FRAME_DELAY}ms`);
  console.log(`Steps: ${STEPS.length}\n`);

  try {
    const screenshots = await takeScreenshots();
    await createGif(screenshots);
    await cleanup();
    console.log("\nAll done! Your demo GIF is ready at public/demo.gif");
  } catch (err) {
    console.error("Error:", err.message);
    console.error("\nMake sure:");
    console.error("  1. Dashboard is running (npm start)");
    console.error("  2. Packages are installed (npm install --save-dev puppeteer gif-encoder-2 pngjs)");
    await cleanup();
    process.exit(1);
  }
}

main();
