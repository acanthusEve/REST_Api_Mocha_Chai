const faker = require('faker');
const moment = require('moment');

const USER_GENDERS = ['female', 'male'];

// YYYY-MM-DD
// 2021-03-21
const today = moment().format('YYYY-MM-DD');
const tomorrow = moment().add(1, 'days').format('YYYY-mm-DD');

const randomString = (length = 8) => faker.random.alphaNumeric(length);

const qaPrefix = 'QATestUser-';

const user = () => {
  return {
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    gender: faker.random.arrayElement(USER_GENDERS),
    email: `${qaPrefix}${randomString()}@example.com`,
    status: 'active',
  };
};

module.exports = {
  user,
  randomString,
  qaPrefix,
  today,
  tomorrow,
};
