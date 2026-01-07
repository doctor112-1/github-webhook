import { createServer } from 'node:http';
import 'dotenv/config'

// https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries
let encoder = new TextEncoder();

async function verifySignature(secret, header, payload) {
  let parts = header.split("=");
  let sigHex = parts[1];

  let algorithm = { name: "HMAC", hash: { name: 'SHA-256' } };

  let keyBytes = encoder.encode(secret);
  let extractable = false;
  let key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    algorithm,
    extractable,
    ["sign", "verify"],
  );

  let sigBytes = hexToBytes(sigHex);
  let dataBytes = encoder.encode(payload);
  let equal = await crypto.subtle.verify(
    algorithm.name,
    key,
    sigBytes,
    dataBytes,
  );

  return equal;
}

function hexToBytes(hex) {
  let len = hex.length / 2;
  let bytes = new Uint8Array(len);

  let index = 0;
  for (let i = 0; i < hex.length; i += 2) {
    let c = hex.slice(i, i + 2);
    let b = parseInt(c, 16);
    bytes[index] = b;
    index += 1;
  }

  return bytes;
}


createServer((request, response) => {
  if (request.headers["x-hub-signature-256"] == undefined) {
    response.writeHead(401)
    response.end()
    return
  }

  let body = ""

  request.on("data", (chunk) => {
    body += chunk.toString()
  })

  request.on("end", async () => {
    let isValid = await verifySignature(process.env.SECRET, request.headers["x-hub-signature-256"], body)

    if (isValid == true) {
      // do work
      response.writeHead(200)
      response.end()
    } else {
      response.writeHead(401)
      response.end()
    }
  })
}).listen(process.env.PORT)

console.log("Webhook running")
