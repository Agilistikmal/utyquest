import "dotenv/config";
import playwright from "playwright";

async function main() {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Login Page
  await page.goto("https://sia.uty.ac.id/");
  await page.fill("input#loginNipNim", process.env.NPM);
  await page.fill("input#loginPsw", process.env.PASSWORD);

  const captcha = await page.locator("form .form-group p").innerText();
  const numbers = captcha
    .replace("?", "")
    .split(" ")
    .filter((char) => !isNaN(char) && char !== " ");

  let result = 0;
  for (let i of numbers) {
    result += Number(i);
  }

  console.log(captcha, numbers, result);

  await page.getByPlaceholder("Jawaban anda").fill(result.toString());
  await page.click("button#BtnLogin");

  // Home Page (STD)
  await page.goto("https://sia.uty.ac.id/std/kuesioner");
  const quests = await page.locator(".list-group-item[href]").all();
  for (let quest of quests) {
    const quest_url = await quest.getAttribute("href");
    await page.goto(quest_url);
    const questions = await page.locator(".btn-group").all();
    for (let question of questions) {
      const answers = await question.locator("input").all();
      await answers[0].check();
    }
    await page.click(".panel-footer button");
    console.log("Done");
  }
}

main();
