# Cardano Signature Verifier

A web app to verify CIP-8 wallet signatures collected from Cardano using [MeshJS](https://meshjs.dev/).

## Features

- **Single Signature Verification**: Verify individual Cardano wallet signatures (CIP-8/CIP-30)
- **Bulk Verification**: Upload or paste Clarity Vote Record JSON to verify all signatures at once
- **Hash Support**: Automatically detects and verifies signatures of blake2b-224 hashed messages
- **Drag & Drop**: Upload vote record files via drag and drop

## Tech Stack

### Frontend

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling

### Backend

- **Node.js** - Runtime
- **Vercel Serverless Functions** - API (production)
- **@meshsdk/core** - Cardano signature verification
- **blakejs** - Blake2b hashing for hash-signed messages

## Installation

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install
```

## Development

Run both the server and client in development mode:

```bash
# Terminal 1: Start the API server
npm run server

# Terminal 2: Start the Vite dev server
cd client && npm run dev
```

- API server runs on `http://localhost:8080`
- Vite dev server runs on `http://localhost:5173` (proxies API requests)

## Deployment

This app is designed to deploy to **Vercel**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The `api/verify.js` serverless function handles signature verification in production.

## Input Fields (Single Signature)

- **Stake Address**: The Cardano stake address (e.g., `stake1...` or `stake_test1...`)
- **Message**: The original message that was signed
- **Key**: The COSE_Key hex string from `wallet.signData()` response
- **Signature**: The COSE_Sign1 hex string from `wallet.signData()` response

## Clarity Vote Record Format

The bulk verification tab accepts Clarity Vote Record JSON files with the following structure:

```json
{
  "Votes": {
    "stake_test1...": {
      "Submissions Voted For": [
        {
          "Yes": {
            "key": "a5010102...",
            "message": "{\"wallet\":\"stake_test1...\",\"option\":\"Yes\",...}",
            "signature": "84584aa3..."
          }
        }
      ]
    }
  }
}
```

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
  "signedHash": false,
  "message": "Signature is valid!"
}
```

The `signedHash` field indicates whether the signature was verified against a blake2b-224 hash of the message rather than the message itself.

## License

MIT
