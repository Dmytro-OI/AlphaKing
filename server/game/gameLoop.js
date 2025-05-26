const fs = require('fs');
const path = require('path');

const dictionaryPath = path.join(__dirname, '../data/ua_words.txt');

let dictionary = new Set(
  fs.readFileSync(dictionaryPath, 'utf-8')
    .split('\n')
    .map(w => w.trim().toLowerCase())
);

const getRandomChunk = () => {
  const words = Array.from(dictionary);
  const word = words[Math.floor(Math.random() * words.length)];
  const start = Math.floor(Math.random() * (word.length - 2));
  return word.substring(start, start + 2);
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

module.exports = { getRandomChunk, isValidWord };
