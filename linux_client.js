const { BluetoothSerialPort } = require("bluetooth-serial-port");

const bt = new BluetoothSerialPort();

// Windows (HOST) MAC address
//const WINDOWS_ADDR = "AA:BB:CC:DD:EE:FF"; //specifically tailor for a pc
const WINDOWS_ADDR = "04:E8:B9:31:DB:E2";

bt.findSerialPortChannel(
  WINDOWS_ADDR,
  (channel) => {
    console.log("SPP channel:", channel);

    bt.connect(
      WINDOWS_ADDR,
      channel,
      () => {
        console.log("Connected to Windows host");

        // Receive data
        bt.on("data", (buffer) => {
          process.stdout.write(`[RX] ${buffer.toString("utf8")}`);
        });

        // Send a test message
        bt.write(Buffer.from("But what if I could?\n", "utf8"), (err) => {
          if (err) console.error("Write error:", err);
        });
      },
      (err) => {
        console.error("Connect failed:", err || "(no error provided)");
      }
    );
  },
  () => {
    console.error("Cannot find SPP channel on Windows device");
  }
);
