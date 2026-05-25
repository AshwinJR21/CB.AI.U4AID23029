function calculateChars (text) {
    let character = 0;
    for(_ in text.split("")) character++;
    return character;

}

function calculateWords (text) {
    let word = 0;
    for (_ in text.split(" ")) word++;
    return word;

}

function calculateSentences (text) {
    let sentence = 0;
    for (_ in text.split("\n")) sentence++;
    return sentence;

}
text = "This is an exmaple text.\n this is newline.";

calculate(text);
