const express = require("express");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");

const app = express();
const port = 3000;

app.get("/chart", async (req, res) => {
  try {
    const width = 800;
    const height = 600;
  
    const answers = req.query.answers.replace('[', '').replace(']', '').split(',').map((el) => +el);
  
    const strategies = getStrategies(answers);
  
    const drivers = getDrivers(answers);
  
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  
  
    const data = req.query.type == 'strategies' ? strategies.map((el) => el.value)
               : req.query.type == 'drivers' ? drivers.map((el) => el.value) : [];
  
    const labels = req.query.type == 'strategies' ? strategies.map((el) => el.title)
    : req.query.type == 'drivers' ? drivers.map((el) => el.title) : [];
  
  
    const label = req.query.type == 'strategies' ? 'Стратегия'
    : req.query.type == 'drivers' ? 'Драйвер' : '';
  
    const config = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Стратегия",
            data: data,
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255,99,132,1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      plugins: [{
        id: 'background-colour',
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }]
    };
  
    const buffer = await chartJSNodeCanvas.renderToBuffer(config);
  
    const fileName = __dirname + `/images/${strategies.map((el) => el.value).join('_')}_${req.query.type}.jpg`;
  
    fs.writeFileSync(fileName, buffer);
  
  
    res.sendFile(fileName);
  
  } catch (e) {
    console.log(e);
  }
  
});



app.get('/minStrategy', (req, res) => {
  const answers = req.query.answers.replace('[', '').replace(']', '').split(',').map((el) => +el);

  const strategies = getStrategies(answers);

  function byField(field) {
    return (a, b) => a[field] > b[field] ? 1 : -1;
  }


  strategies.sort(byField('value'));

  const maximalStrategy = strategies[strategies.length - 1];

  res.send(maximalStrategy.title);
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
