import { SerialPort } from "serialport";
import readline from "readline";
import { sendJson, createLengthPrefixedJsonReceiver } from "./stringify_json.js";

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
// let rxBuffer = ""; //receiver buffer to nullify split messages
//
// NOTE: With length-prefixed JSON framing, we no longer use rxBuffer. The receiver reassembles frames.

// Connection success
function markConnected() {
  if (!connected) {
    connected = true;
    console.log("\nLinux connected.");
  }
}

// Connection has been lost
function markLost(reason: string) {
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

// Adapter so framing code can write to SerialPort using the expected interface.
const writer = {
  write: (data: Uint8Array, cb: (err?: unknown) => void) => {
    // SerialPort.write accepts Buffer/Uint8Array; this keeps types consistent.
    port.write(data, (err: any) => cb(err));
  },
};

// base flow
// obj->json->buffer->length prefix->chunk->send->reassemble->parse json->obj
//
// Receiver: reassemble + parse happens inside createLengthPrefixedJsonReceiver
const receiver = createLengthPrefixedJsonReceiver(
  async (msg: unknown) => {
    // Any valid received frame counts as hearing from Linux
    lastSeen = Date.now();
    markConnected();

    if (typeof msg !== "object" || msg === null) {
      process.stdout.write(`[RX] ${String(msg)}\n`);
      return;
    }

    const m = msg as { type?: unknown; data?: unknown };

    // Handle control tokens
    if (m.type === PING_TOKEN) {
      // Reply to heartbeat
      try {
        await sendJson(writer, { type: PONG_TOKEN }, 1024);
      } catch (err: any) {
        console.error("\nWrite error replying to PING:", err?.message || err);
      }
      return;
    }

    if (m.type === DISCONNECT_TOKEN) {
      markLost("graceful disconnect");
      return;
    }

    // Otherwise treat as normal payload
    // Example: m.type === "fileTree" and m.data is your directory tree object
    process.stdout.write(`[RX] ${JSON.stringify(msg)}\n`);
  },
  (err: unknown) => {
    // Bad frame (corrupt length prefix / invalid JSON)
    console.error("Frame error:", err);
  }
);

port.on("data", (buf: Buffer) => {
  // Feed raw bytes into the framed receiver.
  // The receiver handles split messages and reassembly.
  receiver(buf);
});

port.on("error", (err: any) => {
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

rl.on("line", async (line: string) => {
  // Previously: raw newline-delimited strings.
  // Now: framed JSON message so the receiver can reconstruct boundaries.
  try {
    await sendJson(writer, { type: "text", data: line }, 1024);
  } catch (err: any) {
    console.error("Write error:", err.message || err);
    // If writes start failing, connection is likely gone
    markLost("write failure");
  }
});