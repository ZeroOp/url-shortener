process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');
/**
 * CONFIGURATION
 * Set BASE_URL to your redirect endpoint.
 * If testing locally, use: http://localhost:4200/r
 */
const BASE_URL = 'https://link.zeroop.dev/r'; 

const SHORT_URLS = [
  '5w2u6', '5w2uS', '5w2ub', '5w2u4', 
  '5w2uV', '5w2uv', '5w2u8', '5wGt3'
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', // Desktop
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15', // Mobile
  'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36', // Mobile
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', // Desktop
  'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15' // Tablet
];

/**
 * Realistic Global IP Ranges for Geo-Testing
 * US, Germany, India, UK, Singapore
 */
const GLOBAL_IPS = [
  '23.227.38.32',   // New York, US
  '95.90.255.255',  // Berlin, DE
  '103.21.164.0',   // Mumbai, IN
  '185.33.144.1',   // London, UK
  '43.251.172.1',   // Singapore, SG
  '139.59.13.153',  // Bangalore, IN
  '3.5.140.2',      // Tokyo, JP
];

/**
 * Core Request Function
 */
const sendClick = async (shortCode) => {
  const url = `${BASE_URL}/${shortCode}`;
  const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const randomIP = GLOBAL_IPS[Math.floor(Math.random() * GLOBAL_IPS.length)];

  try {
    await axios.get(url, {
      headers: { 
        'User-Agent': randomUA,
        'X-Forwarded-For': randomIP // Spoofs the IP for Geo-IP detection
      },
      maxRedirects: 0, 
      validateStatus: (status) => status >= 200 && status < 400
    });
  } catch (e) {
    // If your backend returns 301/302, Axios considers it a "success" 
    // due to our validateStatus config.
    if (e.response && (e.response.status === 301 || e.response.status === 302)) return;
    console.error(`[Error] ${shortCode}: ${e.message}`);
  }
};

/**
 * TRAFFIC STRATEGIES
 */
const strategies = {
  // Constant low traffic (1 click every 5s)
  steady: (url) => {
    setInterval(() => sendClick(url), 5000);
  },
  // High frequency bursts every 30 seconds
  spiky: (url) => {
    setInterval(async () => {
      console.log(`[Burst] ⚡ Spiking ${url}...`);
      for(let i=0; i<15; i++) sendClick(url);
    }, 30000);
  },
  // Sine wave (traffic grows and shrinks smoothly)
  wave: (url) => {
    let tick = 0;
    setInterval(() => {
      const count = Math.floor(Math.abs(Math.sin(tick) * 8));
      for(let i=0; i<count; i++) sendClick(url);
      tick += 0.2;
    }, 3000);
  }
};

/**
 * START GENERATOR
 */
console.log("🚀 Starting Redirect Load Generator...");
console.log(`Targeting: ${BASE_URL}/<shortCode>`);
console.log("Simulating: Global IPs, Devices, and Time-Series patterns.");

// Assigning patterns to your specific URLs
strategies.steady('5w2u6');
strategies.steady('5w2uS');

strategies.spiky('5w2ub');
strategies.spiky('5w2u4');

strategies.wave('5w2uV');
strategies.wave('5w2uv');
strategies.wave('5w2u8');
strategies.wave('5wGt3');