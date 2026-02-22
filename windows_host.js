const { SerialPort } = require("serialport");
const readline = require("readline");

// Change this to the Incoming COM port created in Windows Bluetooth settings
// Settings -> Bluetooth & Devices -> More Bluetooth Settings -> Com Ports tab -> Add Com5 port if non existent
const PORT_NAME = "COM5";

// Baud rate is usually ignored for Bluetooth SPP COM ports, but SerialPort requires one
const port = new SerialPort({ path: PORT_NAME, baudRate: 9600 });

// Connection monitoring config
const HEARTBEAT_TIMEOUT_MS = 10000; // declare "lost" if no data/ping in this time
const PING_TOKEN = "__PING__";
const PONG_TOKEN = "__PONG__";
const DISCONNECT_TOKEN = "__DISCONNECT__";

// Track last time Linux has been heard from
let lastSeen = Date.now();
let connected = false;

// Buffer for newline-delimited control tokens (since the SPP stream can split messages, as tested with the digits of pi test)
let rxBuffer = ""; //receiver buffer to nullify split messages

// Connection success
function markConnected() {
  if (!connected) {
    connected = true;
    console.log("\nLinux connected.");
  }
}

// Connection has been lost
function markLost(reason) {
  if (connected) {
    connected = false;
    console.log(`\nLinux connection lost (${reason}).`);
  }
}

// Perioding monitor of timeout from linux client
setInterval(() => {
  if (connected && Date.now() - lastSeen > HEARTBEAT_TIMEOUT_MS) {
    markLost("heartbeat timeout");
  }
}, 1000);

port.on("open", () => {
  console.log(`Opened ${PORT_NAME}. Waiting for Linux to connect...`);
});

port.on("data", (buf) => {
  lastSeen = Date.now();
  markConnected();

  // Accumulate and parse newline-delimited tokens/messages
  rxBuffer += buf.toString("utf8");

  // Process complete lines
  let idx;
  while ((idx = rxBuffer.indexOf("\n")) !== -1) {
    const line = rxBuffer.slice(0, idx).replace(/\r$/, "");
    rxBuffer = rxBuffer.slice(idx + 1);

    if (!line) continue;

    // Handle control tokens
    if (line === PING_TOKEN) {
      // Reply to heartbeat
      port.write(Buffer.from(PONG_TOKEN + "\n", "utf8"), (err) => {
        if (err) console.error("\nWrite error replying to PING:", err.message || err);
      });
      continue;
    }

    if (line === DISCONNECT_TOKEN) {
      markLost("graceful disconnect");
      continue;
    }

    // Otherwise treat as normal payload
    process.stdout.write(`[RX] ${line}\n`);
  }
});

port.on("error", (err) => {
  console.error("Serial port error:", err.message || err);
  // If the COM port errors out, treat it as a connection problem
  markLost("serial port error");
});

port.on("close", () => {
  // SerialPort emits close when the port is closed (need to implement a case for when it is gracefully closed)
  markLost("serial port closed");
});

// Simple console input -> send to Linux client
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on("line", (line) => {
  const msg = line + "\n";
  port.write(Buffer.from(msg, "utf8"), (err) => {
    if (err) {
      console.error("Write error:", err.message || err);
      // If writes start failing, connection is likely gone
      markLost("write failure");
    }
  });
});