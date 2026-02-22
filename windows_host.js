const { SerialPort } = require("serialport");
const readline = require("readline");

// Change this to the Incoming COM port created in Windows Bluetooth settings
// Settings -> Bluetooth & Devices -> More Bluetooth Settings -> Com Ports tab -> Add Com5 port if non existent
const PORT_NAME = "COM5";

// Baud rate is usually ignored for Bluetooth SPP COM ports, but SerialPort requires one
const port = new SerialPort({ path: PORT_NAME, baudRate: 9600 });

port.on("open", () => {
  console.log(`Opened ${PORT_NAME}. Waiting for Linux to connect...`);
});

port.on("data", (buf) => {
  // Raw stream: host may receive messages
  process.stdout.write(`[RX] ${buf.toString("utf8")}`);
});

port.on("error", (err) => {
  console.error("Serial port error:", err.message || err);
});

// Simple console input -> send to Linux client
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on("line", (line) => {
  const msg = line + "\n";
  port.write(Buffer.from(msg, "utf8"), (err) => {
    if (err) console.error("Write error:", err.message || err);
  });
});