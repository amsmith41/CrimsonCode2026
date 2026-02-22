// This file helps the host identify the ports on their machine by running 'node list_ports.js'
// The port listed would be COM3, COM4, COM5,..., etc, for the purpose of demonstration, COM5
// Is the chosen port for this instance for the hackathon.
const { SerialPort } = require("serialport");

SerialPort.list().then((ports) => {
  console.log("Ports:");
  for (const p of ports) {
    console.log(`- ${p.path}  ${p.friendlyName || ""}`);
  }
}).catch(console.error);