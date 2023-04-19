const { expect } = require('chai'); // using destructuring
const Api = require('../../src/Dummy-api');

describe('HR Api tests', function () {
  let api;

  before(() => {
    api = new Api();
  });

  it('Get all employees', async function () {
    const response = await api.getEmployees();

    expect(response.status).to.equal('success');
    expect(response).to.be.an('array').that.has.lengthOf(24);
  });

  it('Create an employee', async function () {
    const body = { name: 'John', salary: '123', age: '23' };
    const response = await api.createEmployee(body);

    expect(response.status).to.equal('success');
    expect(response).to.have.property('name', body.name);
    expect(response).to.have.property('salary', body.salary);
    expect(response).to.have.property('age', body.age);
  });

  it('Update an employee', async function () {
    this.retries = 2;
    // this.timeout = 30000;

    // Test setup
    const body = { name: 'John', salary: '123', age: '23' };
    const employeeCreate = await api.createEmployee(body);
    const { id } = employeeCreate;

    // Actual update endpoint test
    const updatedEmployee = { name: 'Mike', salary: '3000', age: '23' };
    const employeeUpdateResponse = await api.updateEmployee(id, updatedEmployee);

    expect(employeeUpdateResponse).to.have.property('status', 'success');
    expect(employeeUpdateResponse).to.have.property('name', updatedEmployee.name);
    expect(employeeUpdateResponse).to.have.property('salary', updatedEmployee.salary);
  });
});
