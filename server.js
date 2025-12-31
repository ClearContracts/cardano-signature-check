const express = require("express");
const { checkSignature } = require("@meshsdk/core");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/verify", (req, res) => {
  try {
    const { stakeAddress, message, signature } = req.body;

    if (!stakeAddress || !message || !signature) {
      return res.status(400).json({
        valid: false,
        error:
          "Missing required fields: stakeAddress, message, and signature are all required",
      });
    }

    // signature should be { key, signature } from frontend
    if (!signature.key || !signature.signature) {
      return res.status(400).json({
        valid: false,
        error: "Both key and signature fields are required",
      });
    }

    // Handle case where message might be double-escaped JSON
    // e.g., "{\"wallet\":\"stake_test1...\"}" with literal backslashes
    let cleanMessage = message;

    if (typeof message === "string") {
      // Check if string contains literal backslash-quote sequences
      if (message.includes('\\"')) {
        // Replace escaped quotes with regular quotes
        cleanMessage = message.replace(/\\"/g, '"');
      }

      // Try to parse as JSON to normalize formatting
      try {
        const parsed = JSON.parse(cleanMessage);
        cleanMessage = JSON.stringify(parsed);
      } catch {
        // Not valid JSON after unescaping, use the unescaped version
      }
    }

    // Convert message to hex (required by checkSignature)
    const messageHex = Buffer.from(cleanMessage).toString("hex");

    const result = checkSignature(messageHex, signature, stakeAddress);

    res.json({
      valid: result,
      message: result ? "Signature is valid!" : "Signature is invalid",
    });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(500).json({
      valid: false,
      error: `Verification failed: ${error.message}`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
