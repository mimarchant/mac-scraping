import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";

puppeteerExtra.use(Stealth());

(async () => {
  const browserObj = await puppeteerExtra.launch();
  const newpage = await browserObj.newPage();

  await newpage.setViewport({ width: 1920, height: 1080 });

  await newpage.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await newpage.goto(
    "https://simple.ripley.cl/tecno/mundo-apple/macbook?s=mdco"
  );

  await newpage.waitForNetworkIdle(); // Wait for network resources to fully load

  await newpage.screenshot({ path: "screenshot_stealth.png" });

  /* await browserObj.close(); */
})();
