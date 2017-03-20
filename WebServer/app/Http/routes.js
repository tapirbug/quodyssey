'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route');

Route.get('game/start/:gameId', 'GameController.startGame');
Route.get('quiz/set/:gameId', 'GameController.setQuestion');
Route.get('quiz/get/:gameId', 'GameController.getQuestion');
Route.get('quiz/result/:questionId/:answer', 'GameController.getResult');