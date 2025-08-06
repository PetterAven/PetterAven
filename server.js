const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const app = express();
const portWeb = 3000;

// Ajusta el puerto al que está conectado tu Arduino
const puertoArduino = new SerialPort({
  path: "COM3", // ← Cambia a tu puerto (ej. COM4, /dev/ttyUSB0)
  baudRate: 9600,
});

const parser = puertoArduino.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let ultimoMensaje = "Esperando datos del Arduino...";

// Leer datos del Arduino
parser.on("data", (data) => {
  console.log("Arduino dice:", data);
  ultimoMensaje = data;
});

// Servir HTML
app.use(express.static(__dirname));

// Enviar datos como eventos SSE (Server-Sent Events)
app.get("/datos", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  setInterval(() => {
    res.write(`data: ${ultimoMensaje}\n\n`);
  }, 1000);
});

app.listen(portWeb, () => {
  console.log(`Servidor web activo en http://localhost:${portWeb}`);
});
