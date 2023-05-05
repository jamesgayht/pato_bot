const { request } = require("http");
const { Telegraf } = require("telegraf");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const sgWeatherURL = "https://api.data.gov.sg";
let isFound = false;

const https = require("https");
const options = {
  host: "api.data.gov.sg",
  port: 443,
  path: "/v1/environment/2-hour-weather-forecast",
  method: "GET",
};

bot.command("start", (ctx) => {
  console.log(ctx.from);
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Welcome to Pato's bot! \nFor weather, please use /weather <area>",
    {}
  );
});

bot.command(`weather`, (ctx) => {
  const inputArr = ctx.message.text.split(" ");
  inputArr.splice(0, 1);
  const area = inputArr.join(" ");
  console.info("area >>> ", area);

  let req = https.request(options, function (res) {
    console.log("STATUS: " + res.statusCode);
    console.log("HEADERS: " + JSON.stringify(res.headers));

    res.setEncoding("utf8");
    res.on("data", function (chunk) {
      //   console.log("BODY: " + chunk);
      const chunkObj = JSON.parse(chunk);
      const itemsObj = chunkObj.items[0];
      const forecasts = itemsObj.forecasts;

      for (let forecast of forecasts) {
        if (forecast.area.toLowerCase() === area.toLowerCase().trim()) {
          bot.telegram.sendMessage(
            ctx.chat.id,
            `Here's the weather forecast for ${forecast.area}. Expect ${forecast.forecast} within the next 2 hours.`,
            {}
          );
          isFound = true;
        }
      }
      if (!isFound) {
        bot.telegram.sendMessage(
          ctx.chat.id,
          `Can't find an area with the name ${area}, please try again.`,
          {}
        );
      }
      isFound = false;
    });
  });

  req.on("error", function (e) {
    console.log("problem with request: " + e.message);
  });

  // write data to request body
  req.write("data\n");
  //   req.write("data\n");
  req.end();
});

bot.launch();
