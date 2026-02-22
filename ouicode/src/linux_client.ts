// @ts-ignore
const { BluetoothSerialPort } = require("bluetooth-serial-port");
const readline = require("readline");

const bt = new BluetoothSerialPort();

// Windows (HOST) MAC address
//const WINDOWS_ADDR = "AA:BB:CC:DD:EE:FF"; //specifically tailor for a pc
const WINDOWS_ADDR = "04:E8:B9:31:DB:E2";

// Framed control tokens (now sent as JSON messages with { type: TOKEN })
const PING_TOKEN = "__PING__";
const PONG_TOKEN = "__PONG__";
const DISCONNECT_TOKEN = "__DISCONNECT__";

bt.findSerialPortChannel(
  WINDOWS_ADDR,
  async (channel: number) => {
    console.log("SPP channel:", channel);

    // Adjust path if linux_client.ts is not in ouicode/src.
    const { sendJson, createLengthPrefixedJsonReceiver } = await import("./stringify_json");

    // Adapter so framing code can write using the expected interface
    const writer = {
      write: (data: Uint8Array, cb: (err?: unknown) => void) => {
        bt.write(Buffer.from(data), (err: any) => cb(err));
      },
    };

    // Receiver: reassemble -> parse JSON -> emit object
    const receiver = createLengthPrefixedJsonReceiver(
      async (msg: unknown) => {
        // Otherwise treat as normal payload
        // Expecting messages like:

        if (typeof msg !== "object" || msg === null) {
          process.stdout.write(`[RX] ${String(msg)}\n`);
          return;
        }

        const m = msg as { type?: unknown; data?: unknown };

        // Handle control tokens
        if (m.type === PING_TOKEN) {
          // Reply to heartbeat
          await sendJson(writer, { type: PONG_TOKEN }, 1024);
          return;
        }

        if (m.type === PONG_TOKEN) {
          // Host is alive; no further action needed
          return;
        }

        if (m.type === DISCONNECT_TOKEN) {
          process.stdout.write(`[RX] graceful disconnect\n`);
          return;
        }

        // Otherwise treat as normal payload
        process.stdout.write(`[RX] ${JSON.stringify(msg)}\n`);
      },
      (err: unknown) => {
        console.error("Frame error:", err);
      }
    );

    bt.connect(
      WINDOWS_ADDR,
      channel,
      () => {
        console.log("Connected to Windows host");

        // Receive data (raw bytes) -> framed receiver handles split messages
        bt.on("data", (buffer: Buffer) => {
          receiver(buffer);
        });

        // Send a test message (framed JSON)
        sendJson(writer, { type: "text", data: "Hello from Linux?" }, 1024).catch((err: any) => {
          console.error("Write error:", err);
        });

        // Heartbeat monitor for the windows host
        setInterval(() => {
          sendJson(writer, { type: PING_TOKEN }, 1024).catch((err: any) => {
            console.error("Heartbeat write error:", err);
          });
        }, 2000);

        // Send continous messages over to Windows Host
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        // Send continous messages over to Windows Host
        rl.on("line", (line: string) => {
          sendJson(writer, { type: "text", data: line }, 1024).catch((err: any) => {
            console.error("Write error:", err);
          });
        });
      },
      (err: any) => {
        console.error("Connect failed:", err || "(no error provided)");
      }
    );
  },
  () => {
    console.error("Cannot find SPP channel on Windows device");
  }
);