// Downloads the CA certificates listed in shared/openID4VP/walletConfig/verifierTrustAnchorUrls.json and bundles
// those whose SHA-256 fingerprint matches. The Android and iOS builds run it.
/* eslint-disable @typescript-eslint/no-var-requires -- a Node script that the builds run as CommonJS */
const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');

const WALLET_CONFIG_DIR = path.join(
  __dirname,
  '../../shared/openID4VP/walletConfig',
);
const OUTPUT_DIR = path.join(WALLET_CONFIG_DIR, 'generated');

function download(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {timeout: 30000}, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error('timed out')));
    request.on('error', reject);
  });
}

// Standard base64 of the DER encoding, as the OpenID4VP library takes it
async function downloadTrustAnchor({url, jsonField, sha256}) {
  const response = await download(url);
  const certificate = new crypto.X509Certificate(
    jsonField ? JSON.parse(response.toString())[jsonField] : response,
  );
  const fingerprint = crypto
    .createHash('sha256')
    .update(certificate.raw)
    .digest('hex');
  if (fingerprint !== sha256) {
    throw new Error(`its SHA-256 fingerprint is ${fingerprint}`);
  }
  return certificate.raw.toString('base64');
}

async function main() {
  const trustAnchorUrls = JSON.parse(
    fs.readFileSync(
      path.join(WALLET_CONFIG_DIR, 'verifierTrustAnchorUrls.json'),
      'utf8',
    ),
  );
  const trustAnchors = [];
  for (const trustAnchorUrl of trustAnchorUrls) {
    try {
      trustAnchors.push(await downloadTrustAnchor(trustAnchorUrl));
      console.log(`Bundled verifier trust anchor: ${trustAnchorUrl.name}`);
    } catch (error) {
      console.warn(
        `Left out verifier trust anchor ${trustAnchorUrl.name} (${trustAnchorUrl.url}): ${error.message}`,
      );
    }
  }
  fs.mkdirSync(OUTPUT_DIR, {recursive: true});
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'verifierTrustAnchors.json'),
    `${JSON.stringify(trustAnchors, null, 2)}\n`,
  );
}

main().catch(error => {
  console.error(
    `Could not bundle the verifier trust anchors: ${error.message}`,
  );
  process.exit(1);
});
