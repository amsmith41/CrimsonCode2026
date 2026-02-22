const { SerialPort } = require("serialport");

SerialPort.list().then((ports) => {
  console.log("Ports:");
  for (const p of ports) {
    console.log(`- ${p.path}  ${p.friendlyName || ""}`);
  }
}).catch(console.error);