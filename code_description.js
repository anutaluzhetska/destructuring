import { createReadStream } from 'node:fs';
import { exit } from 'node:process';
import path from 'path';

const parsed = path.parse(process.argv[1]);

if (!process.argv[2]) {
    console.log(`Роззуй очі!: node ${parsed.base} <input file name>`);
    exit(0);
}

const readFile = createReadStream(process.argv[2], {
    encoding: 'utf8',
    flag: 'r',
    highWaterMark: 10000
});

let allSymbols = 0;
const counters = {};

let allWords = 0;
const wordCount = {};
let zalyshok = ''; 

readFile.on('data', (chunk) => {
    allSymbols += chunk.length;
    
    const currentText = zalyshok + chunk;
    
    for (const char of chunk) {
        counters[char] = (counters[char] || 0) + 1;
    }

    const words = currentText
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(word => word.length > 0);


    if (words.length > 1) {
        const readyWords = words.slice(0, -1);
        const [lastWord] = words.slice(-1);
        
        zalyshok = lastWord;

        allWords += readyWords.length;
        for (const word of readyWords) {
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    } else if (words.length === 1) {
        zalyshok = words[0];
    }
});

readFile.on('end', () => {
    if (zalyshok) {
        allWords += 1;
        wordCount[zalyshok] = (wordCount[zalyshok] || 0) + 1;
    }

    const sortedSymbols = Object.entries(counters).sort((a, b) => b[1] - a[1]);
    const sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);

    console.log("Кількість кожного символу:");
    console.table(sortedSymbols);

    console.log("Загальна кількість слів:", allWords);
    console.log("Кількість кожного слова:");
    console.table(sortedWords);
});
