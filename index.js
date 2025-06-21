const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("M3U8 Puppeteer API is running");
});

app.get("/get_m3u8/:streamId", async (req, res) => {
  const streamId = req.params.streamId;
  const url = `https://sportslivehub01.live/en-IN/stream/${streamId}`;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const pageContent = await page.content();
    const m3u8Url = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script"));
      for (const script of scripts) {
        if (script.textContent.includes(".m3u8")) {
          const match = script.textContent.match(/https?:\/\/.*?\.m3u8[^\s"'\\}]*/);
          if (match) return match[0];
        }
      }
      return null;
    });

    await browser.close();

    if (m3u8Url) {
      res.json({ m3u8: m3u8Url });
    } else {
      res.json({ error: "M3U8 not found in scripts" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch M3U8" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
