const quiz = require('../resources/quiz');

function getQuestion(id) {
    if (id === undefined) id = Math.floor(Math.random() * quiz.length);
    const question = JSON.parse(JSON.stringify(quiz[id])); //Shallow Copy
    delete question.answer;
    question.id = id;
    return question;
};

function getAnswer(id) {
    return quiz[id].answer;
};

module.exports = {
    getQuestion,
    getAnswer
};