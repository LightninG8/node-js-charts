const express = require("express");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const ChartDataLabels = require("chartjs-plugin-datalabels");
const fs = require("fs");

const app = express();
const port = 3000;

app.get("/chart", async (req, res) => {
  try {
    const width = 800;
    const height = 600;

    const answers = req.query.answers
      .replace("[", "")
      .replace("]", "")
      .split(",")
      .map((el) => isNaN(+el) ? 0 : +el);

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
            anchor: 'start',
            align: 'end',
  
          } 
        }
      },
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(config);

    const fileName =
      __dirname +
      `/images/${strategies.map((el) => el.value).join("_")}_${
        req.query.type
      }.jpg`;


    

    fs.writeFileSync(fileName, buffer);


    // res.writeHead(304, {
    //   'Content-Type': 'image/jpg',
    //   'Content-Length': buffer.length,
    // });

    // res.sendFile(fileName);
    

    // res.end(buffer);

    res.statusCode = 200;

    res.setHeader("Content-Type", "image/jpg");

    fs.readFile(filename, (err, image) => {
      res.end(image);
    });

  } catch (e) {
    console.log(e);
  }
});

app.get("/max", (req, res) => {
  const answers = req.query.answers
    .replace("[", "")
    .replace("]", "")
    .split(",")
    .map((el) => isNaN(+el) ? 0 : +el);

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
