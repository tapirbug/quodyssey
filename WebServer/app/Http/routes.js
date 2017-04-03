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

Route.get('start/:gameId?', 'GameController.start');
Route.get('ask/:gameId', 'GameController.ask');
Route.get('getQ/:gameId', 'GameController.getQ');
Route.get('answer/:gameId/:roundId/:answer', 'GameController.answer');
Route.get('resultQ/:gameId/:roundId', 'GameController.resultQ');
Route.get('resultA/:gameId/:roundId', 'GameController.resultA');