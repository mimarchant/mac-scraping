import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Configurar el servicio de correo (Gmail)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para enviar un correo
function sendEmail(subject, htmlContent) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "mimarchtt@gmail.com",
    subject: subject,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Correo enviado: " + info.response);
  });
}

// Función para hacer scraping
async function checkLaptops() {
  const browser = await puppeteer.launch({
    headless: true, // Cambia a false para modo no headless
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Esto puede ayudar a evitar problemas de uso de memoria en GitHub Actions
      "--disable-blink-features=AutomationControlled", // Para evitar la detección
    ],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
  );

  // Deshabilitar la detección de `navigator.webdriver`
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });
  await page.goto("https://simple.ripley.cl/tecno/mundo-apple/macbook?s=mdco");

  const laptops = await page.$$eval(".catalog-product-item", (items) => {
    return items.map((item) => {
      const title = item
        .querySelector(".catalog-product-details__name")
        ?.textContent.trim();
      const priceString = item
        .querySelector(".catalog-prices__offer-price")
        ?.textContent.trim();
      const price = parseInt(priceString.replace(/[.$]/g, "").replace("$", ""));
      const link =
        item.querySelector("a.catalog-product-item")?.href ||
        "link unavailable";
      return { title, price, link };
    });
  });

  await browser.close();

  console.log(laptops, "laptops encontrados")

  // Filtrar por laptops Mac y con precio menor a 800.000 pesos
  const filteredLaptops = laptops.filter(
    (laptop) => laptop.title.includes("MACBOOK") && laptop.price < 800000
  );

  if (filteredLaptops.length > 0) {
    // Crear contenido HTML para el correo
    const laptopInfoHTML = filteredLaptops
      .map(
        (laptop) =>
          `<div><p><span>${laptop.title}</span> - <span>$${laptop.price}</span> - <span><a href="${laptop.link}">Link</a></span></p></div>`
      )
      .join("\n");

    sendEmail("Laptops Mac baratas encontradas", laptopInfoHTML);
  }
}

// Ejecuta el scraping al llamar al script
checkLaptops();
