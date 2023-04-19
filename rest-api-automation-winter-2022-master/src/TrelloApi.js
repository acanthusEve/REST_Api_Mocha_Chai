require('dotenv').config();
const request = require('request-promise');

const { TRELLO_HOST, TRELLO_KEY, TRELLO_TOKEN } = process.env;

const defaultAuthParams = {
  key: TRELLO_KEY,
  token: TRELLO_TOKEN,
};

// This is just a demonstration that the host can be changed externally by
// changing an environment variable (see test:prod script in package.json)
// let { TRELLO_HOST } = process.env;
// if (process.env.PROD === 'true') {
//   TRELLO_HOST = process.env.GOREST_PROD_HOST;
// }

class Api {
  constructor(host = TRELLO_HOST) {
    this.host = host;
    this.request = request.defaults({
      headers: {
        'Content-Type': 'application/json',
      },
      json: true,
      followAllRedirects: true,
    });
  }

  authenticate(authParams = defaultAuthParams) {
    this.request = request.defaults({
      qs: authParams, // this will pass key and token by default with all requests made by authenticated api class instances
      headers: {
        'Content-Type': 'application/json',
        // Alternatively to qa, authorization can be done using header parameters:
        // Authorization: `OAuth oauth_consumer_key="${authParams.key}", oauth_token="${authParams.token}"`,
      },
      json: true, // Automatically parses the JSON string in the response
      // followAllRedirects: true
    });
  }

  // ################ Boards API #####################
  getBoardsListForMember(qs = {}, memberId = 'me') {
    return this.request.get({
      url: `${this.host}/members/${memberId}/boards`,
      qs,
    });
  }

  createBoard(boardProperties) {
    return this.request.post({
      url: `${this.host}/boards`,
      body: boardProperties,
    });
  }

  getBoard(id) {
    return this.request.get({
      url: `${this.host}/boards/${id}`,
    });
  }

  updateBoard(id, body) {
    return this.request.put({
      url: `${this.host}/boards/${id}`,
      body,
    });
  }

  deleteBoard(id) {
    return this.request.delete({
      url: `${this.host}/boards/${id}`,
    });
  }

  // ################ Lists API #####################
  createList(body) {
    return this.request.post({
      url: `${this.host}/lists`,
      body,
    });
  }

  getList(id) {
    return this.request.get({
      url: `${this.host}/lists/${id}`,
    });
  }

  updateList(id, body) {
    return this.request.put({
      url: `${this.host}/lists/${id}`,
      body,
    });
  }

  deleteList(id) {
    return this.request.delete({
      url: `${this.host}/lists/${id}`,
    });
  }

  // ################ Cards API #####################
  createCard(body) {
    return this.request.post({
      url: `${this.host}/cards`,
      body,
    });
  }

  getCard(id) {
    return this.request.get({
      url: `${this.host}/cards/${id}`,
    });
  }

  updateCard(id, body) {
    return this.request.put({
      url: `${this.host}/cards/${id}`,
      body,
    });
  }

  deleteCard(id) {
    return this.request.delete({
      url: `${this.host}/cards/${id}`,
    });
  }

  // ################ Misc API #####################
  search(query, modelTypes = undefined) {
    return this.request.get({
      url: `${this.host}/search`,
      qs: {
        query,
        modelTypes,
      },
    });
  }
}

module.exports = Api;
