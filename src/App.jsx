import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Html5Qrcode, Html5QrcodeScanner } from "html5-qrcode";
import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [type, setType] = useState("text");
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("qrflow-history")) || [];
    } catch {
      return [];
    }
  });

  const [qrColor, setQrColor] = useState("#111111");
  const [bgColor, setBgColor] = useState("#ffffff");
  const fileInput = useRef(null);

  useEffect(() => {
    localStorage.setItem("qrflow-history", JSON.stringify(history));
  }, [history]);

  const addHistory = (text, kind = "Scan") => {
    if (!text?.trim()) return;

    const item = {
      text,
      kind,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setHistory((old) => [
      item,
      ...old.filter((x) => x.text !== text),
    ].slice(0, 10));
  };

  const handleScan = (text) => {
    setResult(text);
    addHistory(text, "Scan");
    setPage("scan");
  };

  const generateQR = () => {
    if (!value.trim()) return;

    setResult(value);
    addHistory(value, "Generated");
  };

  const scanImage = async (file) => {
    if (!file) return;

    try {
      const scanner = new Html5Qrcode("image-reader");

      const decoded = await scanner.scanFile(file, true);

      setResult(decoded);
      addHistory(decoded, "Image Scan");

      await scanner.clear().catch(() => {});
    } catch {
      alert("No QR code found in this image.");
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector("#qr-canvas canvas");

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "qrflow-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyResult = async () => {
    if (!result) return;

    await navigator.clipboard.writeText(result);
    alert("Copied!");
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <button className="brand" onClick={() => setPage("home")}>
          <span>⌁</span> QR<span>FLOW</span>
        </button>

        <nav>
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            className={page === "scan" ? "active" : ""}
            onClick={() => setPage("scan")}
          >
            Scan
          </button>

          <button
            className={page === "generate" ? "active" : ""}
            onClick={() => setPage("generate")}
          >
            Generate
          </button>

          <button
            className={page === "history" ? "active" : ""}
            onClick={() => setPage("history")}
          >
            History
          </button>
        </nav>
      </header>

      {/* HOME */}
      {page === "home" && (
        <main className="hero">

          <div className="badge">
            ⚡ FAST • SIMPLE • PRIVATE
          </div>

          <h1>
            Scan.
            <br />
            <span>Generate.</span>
            <br />
            Connect.
          </h1>

          <p>
            A simple QR toolkit for scanning and creating
            beautiful QR codes.
          </p>

          <div className="hero-actions">
            <button
              className="primary"
              onClick={() => setPage("scan")}
            >
              📷 Scan QR
            </button>

            <button
              className="secondary"
              onClick={() => setPage("generate")}
            >
              ＋ Generate QR
            </button>
          </div>

          <div className="feature-row">

            <div className="feature">
              <b>📷</b>
              <strong>Scan</strong>
              <small>Camera or image</small>
            </div>

            <div className="feature">
              <b>🎨</b>
              <strong>Customize</strong>
              <small>Your QR style</small>
            </div>

            <div className="feature">
              <b>🕘</b>
              <strong>History</strong>
              <small>Recent activity</small>
            </div>

          </div>
        </main>
      )}

      {/* SCANNER */}
      {page === "scan" && (
        <main className="workspace">

          <button
            className="back"
            onClick={() => setPage("home")}
          >
            ← Back
          </button>

          <div className="page-title">
            <div className="badge">LIVE SCANNER</div>

            <h2>Scan a QR Code</h2>

            <p>
              Point your camera at a QR code or upload an image.
            </p>
          </div>

          <div className="scanner-card">

            <div id="qr-reader"></div>

            <div className="scan-divider">
              <span>OR</span>
            </div>

            <button
              className="upload-button"
              onClick={() => fileInput.current.click()}
            >
              🖼️ Scan from Image
            </button>

            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) =>
                scanImage(e.target.files[0])
              }
            />

            <div id="image-reader"></div>

          </div>

          {result && (
            <ResultCard
              result={result}
              copyResult={copyResult}
            />
          )}

          <ScannerInitializer onScan={handleScan} />

        </main>
      )}

      {/* GENERATOR */}
      {page === "generate" && (
        <main className="workspace">

          <button
            className="back"
            onClick={() => setPage("home")}
          >
            ← Back
          </button>

          <div className="page-title">
            <div className="badge">QR GENERATOR</div>

            <h2>Create Your QR</h2>

            <p>
              Enter your content and create a custom QR code.
            </p>
          </div>

          <div className="generator">

            {/* FORM */}
            <section className="form-card">

              <div className="types">

                {[
                  "text",
                  "url",
                  "email",
                  "phone",
                  "wifi",
                ].map((item) => (
                  <button
                    key={item}
                    className={
                      type === item ? "selected" : ""
                    }
                    onClick={() => setType(item)}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}

              </div>

              <label>
                {type === "url"
                  ? "Website URL"
                  : type === "email"
                  ? "Email"
                  : type === "phone"
                  ? "Phone number"
                  : type === "wifi"
                  ? "Wi-Fi information"
                  : "Text"}
              </label>

              <textarea
                value={value}
                onChange={(e) =>
                  setValue(e.target.value)
                }
                placeholder="Enter your content..."
              />

              {/* CUSTOMIZATION */}

              <div className="customization">

                <div>
                  <label>QR COLOR</label>

                  <div className="color-control">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) =>
                        setQrColor(e.target.value)
                      }
                    />

                    <span>{qrColor}</span>
                  </div>
                </div>

                <div>
                  <label>BACKGROUND</label>

                  <div className="color-control">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) =>
                        setBgColor(e.target.value)
                      }
                    />

                    <span>{bgColor}</span>
                  </div>
                </div>

              </div>

              <button
                className="generate-button"
                onClick={generateQR}
              >
                Generate QR →
              </button>

            </section>

            {/* PREVIEW */}
            <section className="preview-card">

              <div
                className="qr-box"
                style={{
                  backgroundColor: bgColor,
                }}
                id="qr-canvas"
              >

                {result ? (
                  <QRCodeCanvas
                    value={result}
                    size={240}
                    level="H"
                    fgColor={qrColor}
                    bgColor={bgColor}
                  />
                ) : (
                  <div className="empty-qr">
                    <strong>QR</strong>
                    <span>PREVIEW</span>
                  </div>
                )}

              </div>

              {result && (
                <button
                  className="download-button"
                  onClick={downloadQR}
                >
                  ↓ Download PNG
                </button>
              )}

            </section>

          </div>

        </main>
      )}

      {/* HISTORY */}
      {page === "history" && (
        <main className="workspace history-page">

          <button
            className="back"
            onClick={() => setPage("home")}
          >
            ← Back
          </button>

          <div className="page-title">
            <div className="badge">RECENT ACTIVITY</div>

            <h2>History</h2>

            <p>
              Your last 10 QR scans and generated codes.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <div>🕘</div>
              <h3>No history yet</h3>
              <p>
                Scan or generate a QR code to see it here.
              </p>
            </div>
          ) : (
            <div className="history-list">

              {history.map((item, index) => (

                <div
                  className="history-item"
                  key={index}
                >

                  <div className="history-icon">
                    {item.kind === "Generated"
                      ? "⌁"
                      : "📷"}
                  </div>

                  <div className="history-content">

                    <small>{item.kind}</small>

                    <div>{item.text}</div>

                    <span>{item.time}</span>

                  </div>

                  <button
                    onClick={() => {
                      setResult(item.text);
                      setPage(
                        item.kind === "Generated"
                          ? "generate"
                          : "scan"
                      );
                    }}
                  >
                    Open
                  </button>

                </div>

              ))}

              <button
                className="clear-history"
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem(
                    "qrflow-history"
                  );
                }}
              >
                Clear History
              </button>

            </div>
          )}

        </main>
      )}

    </div>
  );
}


/* ---------------- SCANNER ---------------- */

function ScannerInitializer({ onScan }) {

  useEffect(() => {

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);

        scanner.clear().catch(() => {});
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };

  }, [onScan]);

  return null;
}


/* ---------------- RESULT ---------------- */

function ResultCard({ result, copyResult }) {

  const isURL =
    result.startsWith("http://") ||
    result.startsWith("https://");

  return (
    <div className="result-card">

      <label>SCAN RESULT</label>

      <div className="result-text">
        {result}
      </div>

      <div className="result-actions">

        <button onClick={copyResult}>
          Copy
        </button>

        {isURL && (
          <a
            href={result}
            target="_blank"
            rel="noreferrer"
          >
            Open ↗
          </a>
        )}

      </div>

    </div>
  );
}

export default App;