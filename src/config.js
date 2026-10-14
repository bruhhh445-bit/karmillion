// Public config. Nothing in this file is secret.
// NEVER put the bot token or service-account keys in this repository.

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCmx_V-UJapxqTQ7LuhQmCY1QhHoiZ3qSo',
  authDomain: 'karmillion-9f827.firebaseapp.com',
  projectId: 'karmillion-9f827',
  storageBucket: 'karmillion-9f827.firebasestorage.app',
  messagingSenderId: '1080769065740',
  appId: '1:1080769065740:web:5da05e768198d686de8f29',
};

// Adsgram block IDs from partner.adsgram.ai (public, not secret).
export const ADSGRAM_REWARDED_ID = '53879';
export const ADSGRAM_INTERSTITIAL_ID = 'int-53880';
export const ADSGRAM_TASK_ID = 'task-53881';

// Minimum pause between interstitial ads.
export const INTERSTITIAL_GAP_MIN = 3;

// Max time offline income keeps accumulating.
export const OFFLINE_CAP_HOURS = 2;

// How long the "x2 income" ad boost lasts.
export const BOOST_MINUTES = 5;

// Link to the YouTube channel shown in the Bonus tab. Empty = button hidden.
export const YOUTUBE_URL = '';
