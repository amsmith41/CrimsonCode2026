// @ts-ignore
const { BluetoothSerialPort } = require("bluetooth-serial-port");
const readline = require("readline");

const bt = new BluetoothSerialPort();

// Windows (HOST) MAC address
//const WINDOWS_ADDR = "AA:BB:CC:DD:EE:FF"; //specifically tailor for a pc
const WINDOWS_ADDR = "04:E8:B9:31:DB:E2";

bt.findSerialPortChannel(
  WINDOWS_ADDR,
  (channel: number) => {
    console.log("SPP channel:", channel);

    bt.connect(
      WINDOWS_ADDR,
      channel,
      () => {
        console.log("Connected to Windows host");

        // Receive data
        bt.on("data", (buffer: Buffer) => {
          process.stdout.write(`[RX] ${buffer.toString("utf8")}`);
        });

        // Send a test message
        bt.write(Buffer.from("Hello from Linux?\n", "utf8"), (err: any) => {
          if (err) console.error("Write error:", err);
        });

        // Heartbeat monitor for the windows host
        setInterval(() => {
          bt.write(Buffer.from("__PING__\n", "utf8"), (err: any) => {
            if (err) {
              console.error("Heartbeat write error:", err);
            }
          });
        }, 2000);

        // Send continous messages over to Windows Host
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        // Send continous messages over to Windows Host
        rl.on("line", (line:string) => {
          const msg = line + "\n";
          bt.write(Buffer.from(msg, "utf8"), (err: any) => {
            if (err) {console.error("Write error:", err);};
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
