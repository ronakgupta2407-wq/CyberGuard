import { useRef, useState } from "react";

function UploadBox() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // ================================
  // FILE SELECTION
  // ================================
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // ================================
  // DRAG OVER
  // ================================
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  // ================================
  // DRAG LEAVE
  // ================================
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // ================================
  // DROP
  // ================================
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please drop a PDF file.");
      return;
    }

    setSelectedFile(file);
  };

  // ================================
  // REMOVE FILE
  // ================================
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // ================================
  // ANALYZE
  // ================================
  const handleAnalyze = () => {
    if (!selectedFile && !text.trim()) {
      alert(
        "Please upload a PDF or paste your Terms of Service first."
      );
      return;
    }

    console.log("PDF:", selectedFile);
    console.log("TEXT:", text);

    alert("Frontend is working. Backend will be connected next.");
  };

  return (
    <section className="upload-section" id="analyzer">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="upload-header">

        <p className="eyebrow">
          TOS ANALYZER
        </p>

        <h2>
          Analyze Your <span>Terms of Service</span>
        </h2>

        <p>
          Upload a Terms of Service document or paste
          the text below. CyberGuard will analyze the
          document and identify potentially risky clauses.
        </p>

      </div>


      {/* =====================================
          MAIN CARD
      ===================================== */}

      <div className="upload-card">

        {/* =================================
            PDF DROP AREA
        ================================= */}

        <div
          className={`drop-zone ${
            isDragging ? "dragging" : ""
          }`}

          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          <div className="upload-icon">
            🛡️
          </div>


          {/* =================================
              NO FILE
          ================================= */}

          {!selectedFile ? (
            <>
              <h3>
                Upload your Terms of Service
              </h3>

              <p>
                Drag & drop your PDF here
              </p>

              <span>
                or
              </span>


              {/* =================================
                  NATIVE FILE PICKER
                  Click the button to reliably open the
                  Windows file explorer across browsers.
              ================================= */}

              <button
                type="button"
                className="browse-button"
                onClick={openFilePicker}
              >
                Browse File
              </button>

              <input
                ref={fileInputRef}
                id="tos-pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="file-input"
              />


              <small>
                Supported format: PDF
              </small>
            </>
          ) : (

            /* =================================
               FILE SELECTED
            ================================= */

            <>
              <h3>
                PDF Ready
              </h3>

              <p className="selected-file">
                📄 {selectedFile.name}
              </p>

              <small>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </small>

              <button
                type="button"
                className="remove-file-button"
                onClick={handleRemoveFile}
              >
                Remove File
              </button>
            </>
          )}

        </div>


        {/* =====================================
            DIVIDER
        ===================================== */}

        <div className="divider">
          <span>OR</span>
        </div>


        {/* =====================================
            TEXT INPUT
        ===================================== */}

        <div className="text-input-area">

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste your Terms of Service here..."
          />


          <div className="text-footer">

            <span>
              {text.length} characters
            </span>

            <button
              type="button"
              className="analyze-button"
              onClick={handleAnalyze}
            >
              🔍 Analyze TOS
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default UploadBox;