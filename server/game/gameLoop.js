const fs = require('fs');
const path = require('path');

const dictionary = new Set(
  fs.readFileSync(path.join(__dirname, '../data/ua_words.txt'), 'utf-8')
    .split('\n')
    .map(w => w.trim().toLowerCase())
);

const getRandomChunk = () => {
  const word = dictionary[Math.floor(Math.random() * dictionary.length)];
  const len = word.length;
  const start = Math.floor(Math.random() * (len - 2));
  return word.substring(start, start + 2); // 2-літерна вставка
};

const isValidWord = (chunk, word, usedWords) => {
  return (
    word.length >= 3 &&
    word.includes(chunk) &&
    dictionary.includes(word.toLowerCase()) &&
    !usedWords.includes(word.toLowerCase())
  );
};

module.exports = {
  getRandomChunk,
  isValidWord
};
