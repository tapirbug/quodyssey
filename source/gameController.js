const editDistance = require('./editDistance');
const quizController = require('./quizController');

const estimationRange = 0.1;
const maxEditDistance = 2;
const games = {};

function start(req, res) {
    const gameId = req.body.gameId;
    const cssUrl = req.body.cssUrl || req.protocol + '://' + req.get('host') + '/default.css';
    if (gameId == undefined) {
        gameId = Math.floor(Math.random() * 9000 + 1000);
        while (games[gameId] != undefined) gameId = Math.floor(Math.random() * 9000 + 1000);
    }
    if (gameId < 1000 || gameId > 9999) return res.json({ 'success': false, 'error': 'Wrong ID format.' });
    if (games[gameId] != undefined) return res.json({ 'success': false, 'error': 'ID unavailable.' });
    games[gameId] = { 'roundId': 0, 'rounds': [], 'users': {}, 'cssUrl': cssUrl };
    return res.json({ 'success': true, 'gameId': gameId });
};

function join(req, res) {
    const gameId = req.body.gameId;
    const username = req.body.username;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });
    if (games[gameId].users[username] != undefined) return res.json({ 'success': false, 'error': 'Name unavailable.' });
    games[gameId].users[username] = { 'score': 0, 'round': 0 };
    return res.json({ 'success': true, 'cssUrl': games[gameId].cssUrl });
};

function ask(req, res) {
    const gameId = req.body.gameId;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });

    games[gameId].roundId++;
    const question = quizController.getQuestion();
    const date = new Date();
    date.setSeconds(date.getSeconds() + 20);
    if (question.type == 'choice') {
        games[gameId].rounds[games[gameId].roundId] = { 'question': question.id, 'participants': 0, 'correct': 0, 'a': 0, 'b': 0, 'c': 0, 'd': 0, 'end': date };
    } else if (question.type == 'estimate') {
        games[gameId].rounds[games[gameId].roundId] = { 'question': question.id, 'participants': 0, 'correct': 0, 'max': undefined, 'min': undefined, 'end': date };
    } else if (question.type == 'open') {
        games[gameId].rounds[games[gameId].roundId] = { 'question': question.id, 'participants': 0, 'correct': 0, 'end': date };
    }
    return res.json({ 'success': true, 'round': games[gameId].roundId, 'question': question.id });
};

function getQuestion(req, res) {
    let gameId = req.params.gameId;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });
    let game = games[gameId];
    let round = game.rounds[game.roundId];
    if (round == undefined || round.end < new Date()) return res.json({ 'success': false, 'error': 'No question available.' });
    let remainingTime = round.end.getTime() - new Date().getTime();
    return res.json({ 'success': true, 'round': game.roundId, 'question': quizController.getQuestion(round.question), 'end': remainingTime });
};

function answer(req, res) {
    let gameId = req.body.gameId;
    let roundId = req.body.roundId;
    let answer = req.body.answer;
    let username = req.body.username;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });
    if (games[gameId].rounds[roundId] == undefined) return res.json({ 'success': false, 'error': 'Round not found.' });
    if (games[gameId].users[username] == undefined) return res.json({ 'success': false, 'error': 'User not found.' });
    let game = games[gameId];
    let round = game.rounds[roundId];
    if (round.end < new Date()) return res.json({ 'success': false, 'error': 'Round over.' });
    let question = quizController.getQuestion(round.question);
    if (games[gameId].users[username].round >= roundId) return res.json({ 'success': false, 'error': 'User has already answered.' });
    if (question.type == 'choice' && !['a', 'b', 'c', 'd'].includes(answer)) return res.json({ 'success': false, 'error': 'Wrong answer format.' });
    if (question.type == 'estimate' && isNaN(answer)) return res.json({ 'success': false, 'error': 'Answer was not a number.' });

    games[gameId].users[username].round = roundId;
    round.participants++;
    if (question.type == 'choice') {
        round[answer]++;
        if (answer == quizController.getAnswer(round.question)) {
            round.correct++;
            games[gameId].users[username].score++;
        }
        return res.json({ 'success': true });
    } else if (question.type == 'estimate') {
        if (round.min == undefined || answer < round.min) round.min = answer;
        if (round.max == undefined || answer > round.max) round.max = answer;
        if (Math.abs(quizController.getAnswer(round.question) - answer) < quizController.getAnswer(round.question) * estimationRange) {
            round.correct++;
            games[gameId].users[username].score++;
        }
        return res.json({ 'success': true });
    } else if (question.type == 'open') {
        if (editDistance(quizController.getAnswer(round.question), answer, maxEditDistance)) {
            round.correct++;
            games[gameId].users[username].score++;
        }
        return res.json({ 'success': true });
    }
};

function resultQuiz(req, res) {
    let gameId = req.params.gameId;
    let roundId = req.params.roundId;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });
    if (games[gameId].rounds[roundId] == undefined) return res.json({ 'success': false, 'error': 'Round not found.' });
    let round = games[gameId].rounds[roundId];
    if (round.end > new Date()) return res.json({ 'success': false, 'error': 'Round not over.' });
    let type = quizController.getQuestion(round.question).type;
    let answer = quizController.getAnswer(round.question);
    return res.json({ 'success': true, 'answer': answer, 'result': round });
};

function resultAction(req, res) {
    let gameId = req.params.gameId;
    let roundId = req.params.roundId;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });
    if (games[gameId].rounds[roundId] == undefined) return res.json({ 'success': false, 'error': 'Round not found.' });
    let round = games[gameId].rounds[roundId];
    if (round.end > new Date()) return res.json({ 'success': false, 'error': 'Round not over.' });
    return res.json({ 'success': true, 'result': round.correct == 0 ? 0 : round.correct / round.participants });
};

function scoreboard(req, res) {
    let gameId = req.params.gameId;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });
    let users = games[gameId].users;
    let scoreboard = {};
    for (let key in users) {
        scoreboard[key] = users[key].score;
    };
    return res.json({ 'success': true, 'scoreboard': scoreboard });
};

function end(req, res) {
    let gameId = req.body.gameId;
    if (games[gameId] == undefined) return res.json({ 'success': false, 'error': 'Game not found.' });
    games[gameId] = undefined;
    return res.json({ 'success': true });
};

module.exports = {
    start,
    join,
    ask,
    getQuestion,
    answer,
    resultQuiz,
    resultAction,
    scoreboard,
    end
};