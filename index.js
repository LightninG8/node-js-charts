const express = require("express");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const ChartDataLabels = require("chartjs-plugin-datalabels");
const fs = require("fs");

const bodyParser = require("body-parser");
const ImageDataURI = require("image-data-uri");
const axios = require("axios");
const { ImgurClient } = require("imgur");
const cors = require("cors");

const app = express();
const port = 3000;

const client = new ImgurClient({
  clientId: process.env.IMGUR_CLIENT_ID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});


app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static("public"));

app.get("/chart", async (req, res) => {
  try {
    const width = 800;
    const height = 600;

    const answers = req.query.answers
      .replace("[", "")
      .replace("]", "")
      .split(",")
      .map((el) => (isNaN(+el) ? 0 : +el));

    const strategies = getStrategies(answers);

    const drivers = getDrivers(answers);

    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

    const data =
      req.query.type == "strategies"
        ? strategies.map((el) => el.value)
        : req.query.type == "drivers"
        ? drivers.map((el) => el.value)
        : [];

    const labels =
      req.query.type == "strategies"
        ? strategies.map((el) => el.title)
        : req.query.type == "drivers"
        ? drivers.map((el) => el.title)
        : [];

    const label =
      req.query.type == "strategies"
        ? "Стратегия"
        : req.query.type == "drivers"
        ? "Драйвер"
        : "";

    const config = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: data,
            backgroundColor: ["#5da8b0", "rgba(56,199,195,1)"],
          },
        ],
      },
      plugins: [
        {
          id: "background-colour",
          beforeDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
          },
        },
        ChartDataLabels,
      ],
      options: {
        scales: {
          y: {
            max: 30,
          },
        },
        plugins: {
          datalabels: {
            anchor: "start",
            align: "end",
          },
        },
      },
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(config);

    const fileName =
      __dirname +
      `/images/${strategies.map((el) => el.value).join("_")}_${
        req.query.type
      }.jpg`;

    // fs.writeFileSync(fileName, buffer);

    // res.writeHead(304, {
    //   'Content-Type': 'image/jpg',
    //   'Content-Length': buffer.length,
    // });

    // res.sendFile(fileName);

    // res.end(buffer);

    res.statusCode = 200;

    res.setHeader("Content-Type", "image/jpg");

    // fs.readFile(fileName, (err, image) => {
    //   res.end(image);
    // });

    res.end(buffer);
  } catch (e) {
    console.log(e);
  }
});

app.get("/max", (req, res) => {
  const answers = req.query.answers
    .replace("[", "")
    .replace("]", "")
    .split(",")
    .map((el) => (isNaN(+el) ? 0 : +el));

  const data =
    req.query.type == "strategies"
      ? getStrategies(answers)
      : req.query.type == "drivers"
      ? getDrivers(answers)
      : [];

  function byField(field) {
    return (a, b) => (a[field] > b[field] ? 1 : -1);
  }

  data.sort(byField("value"));

  const maximal = data[data.length - 1];

  res.json({ max: maximal.title });
});

app.post("/send_bot_notification", async (req, res) => {
  try {
    const date = new Date().getTime();
    const filePath = `./public/${date}.jpg`;

    await ImageDataURI.outputFile(req.body.imade_data, filePath);

    const response = await client.upload({
      image: fs.createReadStream(filePath),
      type: "stream",
    });

    fs.unlink(filePath, () => {});

    if (!response?.data?.link) {
      return;
    }

    await axios
      .post(
        `https://chatter.salebot.pro/api/32cece2b975d1f7657e0e3f136f7f32b/message`,
        {
          message: req.body.message,
          client_id: req.body.client_id,
          attachment_type: "image",
          attachment_url: response.data.link,
        }
      )
      .then(function (response) {
        console.log(response);
      });

    res.json({ status: 200 });
  } catch (e) {
    console.log(e);

    res.json({ status: 400 });
  }
});


app.listen(port, () => {
  console.log(`App has been started on port ${port}`);
});

function getStrategies(answers) {
  return [
    {
      title: "Поход в горы",
      value: answers[0] + answers[2] + answers[15],
    },
    {
      title: "Волшебство",
      value: answers[1] + answers[16] + answers[27],
    },
    {
      title: "Зебра",
      value: answers[3] + answers[17] + answers[28],
    },
    {
      title: "Борьба с миром",
      value: answers[4] + answers[18] + answers[29],
    },
    {
      title: "Жизнь в кредит",
      value: answers[5] + answers[19] + answers[30],
    },
    {
      title: "Синица в руках",
      value: answers[6] + answers[20] + answers[31],
    },
    {
      title: "Оттолкнуться от дна",
      value: answers[7] + answers[21] + answers[32],
    },
    {
      title: "Бесконечный выбор",
      value: answers[8] + answers[22] + answers[33],
    },
    {
      title: "Здоровая стратегия",
      value: answers[9] + answers[23] + answers[34],
    },
  ];
}

function getDrivers(answers) {
  return [
    {
      title: "Будь совершенным",
      value: answers[10] + answers[24] + answers[31],
    },
    {
      title: "Будь сильным",
      value: answers[11] + answers[15] + answers[29],
    },
    {
      title: "Радуй других",
      value: answers[8] + answers[12] + answers[31],
    },
    {
      title: "Старайся, пытайся",
      value: answers[13] + answers[25] + answers[33],
    },
    {
      title: "Торопись",
      value: answers[14] + answers[26] + answers[35],
    },
  ];
}
