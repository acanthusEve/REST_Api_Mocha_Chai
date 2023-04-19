// const expect = require('chai').expect
const { expect } = require('chai'); // using destructuring
const { triple } = require('./math');

describe('Triple function tests', function () {
  it('passing 3 to triple() function results in 9', function () {
    expect(triple(3)).to.equal(9);
  });

  it('passing 100 to triple() function results in 300', function () {
    expect(triple(100)).to.equal(300);
  });
});
