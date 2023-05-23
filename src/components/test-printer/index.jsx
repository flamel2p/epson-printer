import { useState } from "react";
import "./index.css";

const STATUS = {
  CONNECTING: "Connecting...",
  DISCONNECTED: "Disconnected",
  CONNECTED: "Connected",
  RECONNECT: "Reconnect",
  RECONNECTING: "Reconnecting...",
};

const TestPrinter = () => {
  const [status, setStatus] = useState(STATUS.DISCONNECTED);
  const [ipAddress, setIpAddress] = useState("192.168.50.61");
  const [port, setPort] = useState("9001");
  const [message, setMessage] = useState("");

  const handleConnect = () => {
    try {
      if (window?.epson) {
        if (!window?.eposdev) {
          console.log("initiating eposdev");

          const eposdev = new window.epson.ePOSDevice();

          eposdev.onreconnecting = () => {
            setStatus(STATUS.RECONNECTING);
          };
          eposdev.onreconnect = () => {
            setStatus(STATUS.RECONNECT);
          };
          eposdev.ondisconnect = () => {
            setStatus(STATUS.DISCONNECTED);
          };

          window.eposdev = eposdev;
        }

        setStatus(STATUS.CONNECTING);
        window.eposdev.disconnect();

        window.eposdev.connect(ipAddress, port, (code) => {
          console.log("__code", code);
          if (code === "OK" || code === "SSL_CONNECT_OK") {
            setStatus(STATUS.CONNECTED);

            // Create Printer object
            const deviceId = "local_printer";
            const printerType = window.eposdev.DEVICE_TYPE_PRINTER;

            window.eposdev.createDevice(
              deviceId,
              printerType,
              { crypto: true, buffer: false },
              (deviceObj, code) => {
                if (code === "OK") {
                  window.Printer = deviceObj;
                } else if (code === "DEVICE_IN_USE") {
                  console.warn("DEVICE_IN_USE");
                }
              }
            );
          }
        });
      }
    } catch (e) {
      console.error("Handle Connect Error", e);
    }
  };

  const handlePrint = () => {
    try {
      if (window?.Printer) {
        const printer = window.Printer;

        printer.addPulse(printer.DRAWER_1, printer.PULSE_100); 
        printer.addTextAlign(printer.ALIGN_CENTER);
        printer.addText('\n\n');
        printer.addText(message);
        printer.addFeedLine(1);
        printer.addText('\n\n');
        printer.addCut(printer.CUT_FEED);
        printer.send();
      }
    } catch (e) {
      console.error("Handle Print Error", e);
    }
  }

  return (
    <div className="test-printer">
      <div className="test-printer-container">
        <div className="test-printer-header">Test Printer</div>
        <div className="test-printer-header">{status}</div>
        <div className="test-printer-connector">
          <div className="field">
            <div className="field-label">IP Address</div>
            <input
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>
          <div className="field">
            <div className="field-label">Port</div>
            <input value={port} onChange={(e) => setPort(e.target.value)} />
          </div>
          <div className="btn" onClick={handleConnect}>
            Connect
          </div>
        </div>
        <div className="test-printer-msg">
          <div className="field">
            <div className="field-label">Message</div>
            <textarea
            className="field-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="btn" onClick={handlePrint}>
            Print
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPrinter;
