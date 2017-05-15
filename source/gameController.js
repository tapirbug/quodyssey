const editDistance = require('./editDistance');
const quizController = require('./quizController');

const estimationRange = 0.1;
const maxEditDistance = 2;
const questionDuration = 15;
const postQuestionDuration = 5;

const openIds = [];
for (let i = 1000; i <= 9999; i++) openIds.push(i);
const games = {};

function start(req, res) {
    if (openIds.length === 0) return res.json({ success: false, error: 'No IDs available' });
    const indexOfGameId = req.body.gameId ? openIds.indexOf(parseInt(req.body.gameId)) : 0;
    if (indexOfGameId === -1) return res.json({ success: false, error: 'ID unavailable.' });
    const gameId = openIds.splice(indexOfGameId, 1)[0];
    const cssUrl = req.body.cssUrl || req.protocol + '://' + req.get('host') + '/default.css';
    games[gameId] = { roundId: 0, rounds: [], queuedRounds: 0, users: {}, cssUrl: cssUrl };
    return res.json({ success: true, gameId: gameId });
};

function join(req, res) {
    const gameId = req.body.gameId;
    const username = req.body.username;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    if (games[gameId].users[username]) return res.json({ success: false, error: 'Name unavailable.' });
    games[gameId].users[username] = { score: 0, round: 0 };
    return res.json({ success: true, cssUrl: games[gameId].cssUrl });
};

function ask(req, res) {
    const gameId = req.body.gameId;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    if (games[gameId].roundId !== 0) {
        const remainingTime = games[gameId].rounds[games[gameId].roundId].end.getTime() - new Date().getTime();
        if (remainingTime > -postQuestionDuration * 1000) {
            setTimeout(() => {
                games[gameId].queuedRounds--;
                generateNewQuestion(gameId);
            }, remainingTime + (games[gameId].queuedRounds * (questionDuration + postQuestionDuration) + postQuestionDuration) * 1000);
            games[gameId].queuedRounds++;
            return res.json({ success: true, queuePosition: games[gameId].queuedRounds });
        }
    }
    const question = generateNewQuestion(gameId);
    return res.json({ success: true, round: games[gameId].roundId, question: question.id });
};

function generateNewQuestion(gameId) {
    games[gameId].roundId++;
    const question = quizController.getQuestion();
    const date = new Date();
    date.setSeconds(date.getSeconds() + questionDuration);
    if (question.type == 'choice') {
        games[gameId].rounds[games[gameId].roundId] = { question: question.id, participants: 0, correct: 0, a: 0, b: 0, c: 0, d: 0, end: date };
    } else if (question.type == 'estimate') {
        games[gameId].rounds[games[gameId].roundId] = { question: question.id, participants: 0, correct: 0, max: undefined, min: undefined, end: date };
    } else if (question.type == 'open') {
        games[gameId].rounds[games[gameId].roundId] = { question: question.id, participants: 0, correct: 0, end: date };
    } else if (question.type == 'order') {
        games[gameId].rounds[games[gameId].roundId] = { question: question.id, participants: 0, correct: 0, end: date };
    }
    return question;
}

function getQuestion(req, res) {
    const gameId = req.params.gameId;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    const game = games[gameId];
    const round = game.rounds[game.roundId];
    if (!round || round.end < new Date()) return res.json({ success: false, error: 'No question available.' });
    const remainingTime = round.end.getTime() - new Date().getTime();
    return res.json({ success: true, round: game.roundId, question: quizController.getQuestion(round.question), end: remainingTime });
};

function answer(req, res) {
    const gameId = req.body.gameId;
    const roundId = req.body.roundId;
    const answer = req.body.answer;
    const username = req.body.username;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    if (!games[gameId].rounds[roundId]) return res.json({ success: false, error: 'Round not found.' });
    if (!games[gameId].users[username]) return res.json({ success: false, error: 'User not found.' });
    const game = games[gameId];
    const round = game.rounds[roundId];
    if (round.end < new Date()) return res.json({ success: false, error: 'Round over.' });
    const question = quizController.getQuestion(round.question);
    if (games[gameId].users[username].round >= roundId) return res.json({ success: false, error: 'User has already answered.' });
    if (question.type == 'choice' && !['a', 'b', 'c', 'd'].includes(answer)) return res.json({ success: false, error: 'Wrong answer format.' });
    if (question.type == 'estimate' && isNaN(answer)) return res.json({ success: false, error: 'Answer was not a number.' });
    if (question.type == 'order' && (answer.length != 4 || !answer.includes('a') || !answer.includes('b') || !answer.includes('c') || !answer.includes('d'))) return res.json({ success: false, error: 'Wrong answer format.' });

    games[gameId].users[username].round = roundId;
    round.participants++;
    if (question.type == 'choice') {
        round[answer]++;
        if (answer == quizController.getAnswer(round.question)) {
            round.correct++;
            games[gameId].users[username].score++;
        }
        return res.json({ success: true });
    } else if (question.type == 'estimate') {
        if (!round.min || answer < round.min) round.min = answer;
        if (!round.max || answer > round.max) round.max = answer;
        if (Math.abs(quizController.getAnswer(round.question) - answer) < quizController.getAnswer(round.question) * estimationRange) {
            round.correct++;
            games[gameId].users[username].score++;
        }
        return res.json({ success: true });
    } else if (question.type == 'open') {
        if (editDistance(quizController.getAnswer(round.question), answer, maxEditDistance)) {
            round.correct++;
            games[gameId].users[username].score++;
        }
        return res.json({ success: true });
    } else if (question.type == 'order') {
        if (quizController.getAnswer(round.question) === answer) {
            round.correct++;
            games[gameId].users[username].score++;
        }
        return res.json({ success: true });
    }
};

function resultQuiz(req, res) {
    const gameId = req.params.gameId;
    const roundId = req.params.roundId;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    if (!games[gameId].rounds[roundId]) return res.json({ success: false, error: 'Round not found.' });
    const round = games[gameId].rounds[roundId];
    if (round.end > new Date()) return res.json({ success: false, error: 'Round not over.' });
    const type = quizController.getQuestion(round.question).type;
    const answer = quizController.getAnswer(round.question);
    return res.json({ success: true, answer: answer, result: round });
};

function resultAction(req, res) {
    const gameId = req.params.gameId;
    const roundId = req.params.roundId;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    if (!games[gameId].rounds[roundId]) return res.json({ success: false, error: 'Round not found.' });
    const round = games[gameId].rounds[roundId];
    if (round.end > new Date()) return res.json({ success: false, error: 'Round not over.' });
    return res.json({ success: true, result: round.correct == 0 ? 0 : round.correct / round.participants });
};

function scoreboard(req, res) {
    const gameId = req.params.gameId;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    const users = games[gameId].users;
    const scoreboard = {};
    for (const key in users) {
        scoreboard[key] = users[key].score;
    };
    return res.json({ success: true, scoreboard: scoreboard });
};

function end(req, res) {
    const gameId = req.body.gameId;
    if (!games[gameId]) return res.json({ success: false, error: 'Game not found.' });
    openIds.push(gameId);
    return res.json({ success: true });
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
