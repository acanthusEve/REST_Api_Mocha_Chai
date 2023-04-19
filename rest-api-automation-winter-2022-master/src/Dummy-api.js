const request = require('request-promise');

const baseUrl = 'http://dummy.restapiexample.com';
const prefix = 'api/v1';

class DummyApi {
  constructor() {
    this.request = request.defaults(
      {
        headers: {
          'Content-Type': 'application/json',
        },
        json: true,
      },
    );
  }

  getEmployees() {
    const path = `${baseUrl}/${prefix}/employees`;

    return this.request.get(
      {
        url: path,
      },
    );
  }

  getEmployeeById(id) {
    const path = `${baseUrl}/${prefix}/emp/${id}`;

    return this.request.get(
      {
        url: path,
      },
    );
  }

  createEmployee(jsonBody) {
    const path = `${baseUrl}/${prefix}/create`;

    return this.request.post(
      {
        url: path,
        body: jsonBody,
      },
    );
  }

  updateEmployee(id, jsonBody) {
    const path = `${baseUrl}/${prefix}/update/${id}`;

    return this.request.put(
      {
        url: path,
        body: jsonBody,
      },
    );
  }
}

module.exports = DummyApi;
