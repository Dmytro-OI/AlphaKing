import React from 'react';

function WordInput({ word, setWord, onSubmit }) {
  return (
    <>
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Введи слово"
      />
      <button onClick={onSubmit}>Відправити</button>
    </>
  );
}

export default WordInput;
