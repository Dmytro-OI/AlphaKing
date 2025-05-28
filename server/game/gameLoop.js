const fs = require('fs');
const path = require('path');

const dictionaryPath = path.join(__dirname, '../data/ua_words.txt');

let dictionary = new Set(
  fs.readFileSync(dictionaryPath, 'utf-8')
    .split('\n')
    .map(w => w.trim().toLowerCase())
);

let bigramFreq = {};
dictionary.forEach(word => {
  for (let i = 1; i < word.length - 1; i++) {
    const bigram = word.substring(i, i + 2);
    if (bigram.length === 2) {
      bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
    }
  }
});
const sortedBigrams = Object.entries(bigramFreq).sort((a, b) => b[1] - a[1]);
const topBigrams = sortedBigrams.slice(0, Math.ceil(sortedBigrams.length * 0.5)).map(([bg]) => bg);

const getRandomChunk = () => {
  const chunk = topBigrams[Math.floor(Math.random() * topBigrams.length)];
  return chunk;
};

const isValidWord = (chunk, word, usedWords) => {
  const w = word.toLowerCase();
  return (
    w.length >= 3 &&
    w.includes(chunk) &&
    dictionary.has(w) &&
    !usedWords.includes(w)
  );
};

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const isValidWord2 = async (chunk, word, usedWords) => {
  const w = word.toLowerCase();
  if (!w || w.length < 3) return false;
  if (!w.includes(chunk)) return false;
  if (usedWords.includes(w)) return false;

  const endpoint = 'https://uk.wiktionary.org/w/api.php';
  const params = new URLSearchParams({
    action: 'query',
    titles: word,
    format: 'json',
    formatversion: '2',
    origin: '*',   // для CORS
  });

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`);
    if (!response.ok) {
      console.error('Network response was not ok', response.statusText);
      return false;
    }
    const data = await response.json();
    const page = data.query.pages[0];
    // Якщо є флаг missing => сторінка не знайдена
    return page && !page.missing;
  } catch (error) {
    console.error('Error checking word existence:', error);
    return false;
  }
}


module.exports = { getRandomChunk, isValidWord, isValidWord2 };
