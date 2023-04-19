require('dotenv').config();
const request = require('request-promise');

const prefix = '/public/v2';
// const GOREST_APIKEY = process.env.GOREST_APIKEY;
// const GOREST_HOST = process.env.GOREST_HOST;
const { GOREST_APIKEY, GOREST_HOST } = process.env; // using destructuring

class UsersApi {
  constructor(host = GOREST_HOST) {
    this.host = host;
    this.request = request.defaults({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      json: true,
      // followAllRedirects: true
    });
  }

  /**
   * authenticate - Authenticates API by setting an API key to the authorization header
   * @param {String} apikey (OPTIONAL) api key override, default key is set from the env variable
   */

  authenticate(apikey = GOREST_APIKEY) {
    this.request = request.defaults({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apikey}`,
      },
      json: true,
    });
  }

  async authenticate1(userCredentials) {
    // call POST /authenticate to get the token
    const token = await this.getAuthToken(userCredentials);

    this.request = request.defaults({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      json: true,
    });
  }

  getAuthToken(userCreds) {
    return this.request.post({
      url: `${this.host}/getToken`,
      body: userCreds,
    });
  }

  /**
   * createUser - Authenticates API by setting an API key to the authorization header
   * @param {Object} body object containing user properties: name, email, etc.
   */
  createUser(body) {
    const path = `/${prefix}/users`;

    return this.request.post({
      url: `${this.host}${path}`,
      // body: body,
      body, // same as the line above
    });
  }

  updateUser(userId, userObject) {
    const path = `/${prefix}/users/${userId}`;

    return this.request.put({
      // followRedirect: false,
      url: `${this.host}${path}`,
      body: userObject,
    });
  }

  getUser(userId) {
    const path = `/${prefix}/users/${userId}`;

    return this.request.get({
      // followRedirect: false,
      url: `${this.host}${path}`,
    });
  }

  getUsersList(queryStrings = {}) {
    const path = `/${prefix}/users`;

    return this.request.get(
      {
        url: `${this.host}${path}`,
        qs: queryStrings,
      },
    );
  }

  deleteUser(userId, resolveWithFullResponse = false) {
    const path = `/${prefix}/users/${userId}`;

    return this.request.delete({
      url: `${this.host}${path}`,
      resolveWithFullResponse,
    });
  }
}

module.exports = UsersApi;
