import nodemailer from "nodemailer";
import dotenv from "dotenv";
import puppeteerExtra from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";

puppeteerExtra.use(Stealth());

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

  await newpage.screenshot({ path: "screenshot_stealth_index_new.png" });

  /*   const laptops = await newpage.$$eval(".catalog-product-item", (items) => {
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
  }); */

  const content = await newpage.content();
  console.log(content, "content");

  await browserObj.close();

  /*  console.log(laptops, "laptops encontrados"); */

  // Filtrar por laptops Mac y con precio menor a 800.000 pesos
  /*   const filteredLaptops = laptops.filter(
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
  } */
})();
