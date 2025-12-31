# Cardano Signature Verifier

A simple web app to verify CIP-8 wallet signatures collected from Cardano using [MeshJS](https://meshjs.dev/).

## Features

- Verify Cardano wallet signatures (CIP-8/CIP-30)
- Simple HTML/CSS interface
- Node.js/Express backend using `@meshsdk/core`

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

Then open <http://localhost:3000> in your browser.

## Input Fields

- **Stake Address**: The Cardano stake address (e.g., `stake1...` or `stake_test1...`)
- **Message**: The original message that was signed
- **Key**: The COSE_Key hex string from `wallet.signData()` response
- **Signature**: The COSE_Sign1 hex string from `wallet.signData()` response

## How It Works

When a user signs data with a Cardano wallet using `wallet.signData()`, it returns:

```javascript
{
  key: "a4010103...",      // COSE_Key (hex)
  signature: "845846..."   // COSE_Sign1 (hex)
}
```

This app uses MeshJS's `checkSignature()` function to verify that:

1. The signature is valid for the given message
2. The signature was created by the wallet owning the stake address

## API

### POST /verify

**Request Body:**

```json
{
  "stakeAddress": "stake_test1...",
  "message": "original message text",
  "signature": {
    "key": "a4010103...",
    "signature": "845846..."
  }
}
```

**Response:**

```json
{
  "valid": true,
  "message": "Signature is valid!"
}
```

## License

MIT
