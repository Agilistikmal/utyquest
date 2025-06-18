import playwright from "playwright";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

function main() {
  rl.question(" :: Masukkan NPM -> ", (npm) => {
    rl.question(" :: Masukkan Password -> ", (password) => {
      startAction(npm, password)
        .then(() => {
          console.log("Selesai!");
          rl.close();
        })
        .catch((err) => {
          console.error("Terjadi kesalahan:", err);
          rl.close();
        });
    });
  });
}

async function startAction(npm, password) {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Login Page
  await page.goto("https://sia.uty.ac.id/");
  await page.fill("input#loginNipNim", npm);
  await page.fill("input#loginPsw", password);

  const captcha = await page.locator("form .form-group p").innerText();
  const numbers = captcha
    .replace("?", "")
    .split(" ")
    .filter((char) => !isNaN(char) && char !== " ");

  let result = 0;
  for (let i of numbers) {
    result += Number(i);
  }

  await page.getByPlaceholder("Jawaban anda").fill(result.toString());
  await page.click("button#BtnLogin");

  // Kuesioner PBM
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
    console.log("[Done] " + await quest.innerText());
  }

  // Kuesioner Layanan
  await page.goto("https://sia.uty.ac.id/std/kuesionerlayanan")
  const serviceQuests = await page.locator(".list-group-item[href]").all();
  console.log(`Terdapat ${serviceQuests.length} kuesioner layanan yang tersedia.`);
  for (let serviceQuest of serviceQuests) {
    const quest_url = await serviceQuest.getAttribute("href");
    await page.goto(quest_url);
    const questions = await page.locator(".btn-group").all();
    for (let question of questions) {
      const answers = await question.locator("input").all();
      await answers[0].check();
    }
    await page.click(".panel-footer button");
    console.log("Done");
  }

  await browser.close();
  console.log("Semua kuesioner telah selesai diisi.");
}

main();
