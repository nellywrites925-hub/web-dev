const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async () => {
  const defaultFileUrl = "file://" + path.resolve(__dirname, "index.html");
  const testUrl = process.env.TEST_URL || defaultFileUrl;
  const isHttp = /^https?:\/\//i.test(testUrl);

  // if a TEST_URL is provided and looks like http(s), poll until available
  async function waitForHttp(url, timeout = 5000) {
    const start = Date.now();
    const fetch = require("node-fetch");
    while (Date.now() - start < timeout) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) return true;
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 250));
    }
    return false;
  }
  let browser;
  // Try launching Puppeteer with the newer headless mode and safe args
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (err) {
    // Fallback: try to find a local Chrome/Chromium on Windows machines
    const possible = [
      process.env.PUPPETEER_EXECUTABLE_PATH,
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      "C:/Program Files/Chromium/Application/chrome.exe",
    ].filter(Boolean);
    let found = null;
    for (const p of possible) {
      if (p && fs.existsSync(p)) {
        found = p;
        break;
      }
    }
    if (found) {
      console.log("Launching using local Chrome at", found);
      browser = await puppeteer.launch({
        headless: "new",
        executablePath: found,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      console.error("Initial Puppeteer launch failed.\n", err);
      console.error(
        "No local Chrome executable found in common locations. If you are behind antivirus or have a restricted environment, try setting the environment variable PUPPETEER_EXECUTABLE_PATH to a Chrome/Chromium binary path."
      );
      throw err;
    }
  }
  const page = await browser.newPage();
  if (isHttp) {
    const ok = await waitForHttp(testUrl, 8000);
    if (!ok)
      console.warn(
        "Warning: TEST_URL did not respond to HEAD before timeout:",
        testUrl
      );
  }
  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  try {
    await page.goto(fileUrl, { waitUntil: "networkidle2" });
    console.log("Loaded page:", fileUrl);

    // Wait for sandbox textarea
    await page.waitForSelector("#sandboxInput", { timeout: 3000 });

    // Read default content
    const defaultContent = await page.$eval("#sandboxInput", (el) =>
      el.value.trim()
    );
    console.log("Default sandbox content length:", defaultContent.length);

    // Modify sandbox content and click Run
    const testHtml =
      '<h2>SMOKE TEST</h2><script>console.log("SMOKE_LOG");</script>';
    await page.evaluate((html) => {
      document.querySelector("#sandboxInput").value = html;
    }, testHtml);
    await page.click("#runSandbox");
    await page.waitForTimeout(700);

    // Check that iframe exists in preview
    const iframeCount = await page.$$eval(
      "#sandboxPreview iframe",
      (iframes) => iframes.length
    );
    if (iframeCount === 0)
      throw new Error("Preview iframe not created after Run");
    console.log("Preview iframe created");

    // Wait for message from iframe to appear in console area
    const messageFound = await page
      .waitForFunction(
        () => {
          const consoleBox = document.getElementById("sandboxConsole");
          if (!consoleBox) return false;
          return consoleBox.textContent.includes("SMOKE_LOG");
        },
        { timeout: 3000 }
      )
      .catch(() => false);

    if (!messageFound)
      throw new Error("Sandbox console did not receive log from iframe");
    console.log("Sandbox console received iframe log");

    // Reset sandbox
    await page.click("#resetSandbox");
    await page.waitForTimeout(300);
    const afterReset = await page.$eval("#sandboxInput", (el) =>
      el.value.trim()
    );
    if (afterReset === testHtml.trim())
      throw new Error("Reset did not restore default content");
    console.log("Reset restored default content");

    // Test code-card view and copy
    // Click first view button
    await page.click(".view-btn");
    await page.waitForSelector(".modal", { timeout: 2000 });
    console.log("Code modal opened");

    // Click copy inside modal
    await page.click(".modal-copy");
    await page.waitForTimeout(300);
    console.log("Clicked modal copy (no direct clipboard assert in headless)");

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    const stillOpen = await page.$(".modal");
    if (stillOpen) throw new Error("Modal did not close on Escape");
    console.log("Modal closed on Escape");

    console.log("\nSMOKE TEST PASSED");
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error("SMOKE TEST FAILED:", err.message);
    await browser.close();
    process.exit(2);
  }
})();
