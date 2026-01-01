const { checkSignature } = require("@meshsdk/core");
const blake = require("blakejs");

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    // First try direct message verification
    let result = checkSignature(messageHex, signature, stakeAddress);
    let signedHash = false;

    // If direct verification fails, try with hashed message (blake2b-224)
    if (!result) {
      const hashedMessage = blake.blake2bHex(cleanMessage, undefined, 28);
      const hashedMessageHex = Buffer.from(hashedMessage).toString("hex");
      result = checkSignature(hashedMessageHex, signature, stakeAddress);
      if (result) {
        signedHash = true;
      }
    }

    res.json({
      valid: result,
      signedHash: signedHash,
      message: result
        ? signedHash
          ? "Signature is valid (signed hash of message)"
          : "Signature is valid!"
        : "Signature is invalid",
    });
  } catch (error) {
    console.error("Verification error:", error.message);
    res.status(500).json({
      valid: false,
      error: `Verification failed: ${error.message}`,
    });
  }
};
