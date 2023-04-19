// const expect = require('chai').expect
const { expect } = require('chai'); // using destructuring
const { double } = require('./math');

describe('HR API tests CRUD /employee', function () {
  // before(() => {
  //   // code that runs once before all tests
  // })

  // after(() => {
  //   // code that runs once after all tests are completed
  // })

  beforeEach(() => {
    // code that runs before each test
  });

  afterEach(() => {
    // code that runs after each test
  });

  it('passing 3 to double() function results in 6', function () {
    expect(double(3)).to.equal(6);
  });

  it('passing 3 to double() function results in 6', function () {
    expect(double(3)).to.equal(6);
  });
});
