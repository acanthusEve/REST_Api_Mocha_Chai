const { expect } = require('chai');
const GoRestUsersApi = require('../../src/Gorest-api');
const guard = require('../../utils/guard');
const factory = require('../../src/factory/gorest-factory');
const { validateSchema } = require('../../utils/json-schema/validate-schema');
const retry = require('../../utils/promise-retries');
const wait = require('../../utils/wait');

describe('GoRest Users API tests (/users)', () => {
  let api;
  let unAuthenticatedApi;

  // TEST CLEANUP Function
  const testCleanup = async () => {
    const usersToBeDeleted = await api.getUsersList({ email: factory.qaPrefix });

    await Promise.all(usersToBeDeleted.map((user) => {
      return api.deleteUser(user.id);
    }));
  };

  before(async () => {
    api = new GoRestUsersApi();

    // authenticate method sets Bearer token in the headers of all api requests
    api.authenticate();

    unAuthenticatedApi = new GoRestUsersApi();
    // If we need an unauthenticated API, just don't run authenticate()

    // You can optionally implement authenticate function to take custom Apikey
    // apiAdmin = new UsersApi()
    // apiAdmin.authenticate("customAdminApiKey")

    // Or make another call to exchange for example an object with user credentials to an api key
    // api.authenticate1({username: "Test", password: "12345"});

    await testCleanup();
  });

  afterEach(async () => {
    // TEST CLEANUP
    // // Easiest solution
    // let user; // Needs to be placed under top level describe()
    // afterEach(async () => {
    //   if (user) {
    //     await api.deleteUser(user.result.id);
    //   }
    // });

    // // MORE ADVANCED
    // let users = []; // Needs to be placed under top level describe()
    // afterEach(async () => {
    //   let count = 0
    //   for (const user of users) {
    //     await api.deleteUser(user.result.id)
    //     count++;
    //   }
    //   users = [];
    //   console.log(`${count} user(s) have been deleted`)
    //   count = 0;
    // });

    // // MORE ADVANCED and faster
    // afterEach(async () => {
    //   if (users.length > 0) {
    //     console.log(`Going to delete ${users.length} users!`)
    //     await Promise.all(users.map(async user => {
    //       await api.deleteUser(user.result.id)
    //     }))
    //     users = [];
    //   }
    // });

    // // IDEAL
    // afterEach(async () => {
    //   const { result: usersToBeDeleted } = await api.getUsersList({ email: 'qatest' });
    //   await Promise.all(usersToBeDeleted.map(async user => {
    //     await api.deleteUser(user.id)
    //   }))
    // });

    await testCleanup();
  });

  describe('GoRest Users API miscellaneous tests', () => {
    it('Error message returned when creating a user as an authenticated user (POST /users)', async () => {
      const err = await guard(async () => unAuthenticatedApi.createUser(factory.user()));

      // expect(response).to.have.property("name", userToBeCreated.name)
      expect(err).to.have.property('statusCode', 401);
      expect(err).to.have.property('message', '401 - {"message":"Authentication failed"}');
    });
  });

  describe('GoRest Create users (POST /users)', () => {
    it('Can create new user (POST /users)', async function () {
      // Don't use factory on a main test of an endpoint. This way you will be able to easily see what is being sent and
      // have an easy way to change request body if needed for testing purposes.
      const userToBeCreated = {
        name: 'Test 1',
        gender: 'male',
        email: `${Math.random().toString(36).slice(2)}@example.com`, // or Date.now()
        status: 'active',
      };

      const userCreateResponse = await api.createUser(userToBeCreated);

      // JSON Schema validation
      validateSchema('createUser', userCreateResponse);

      expect(userCreateResponse).to.have.property('id').that.is.a('number');
      expect(userCreateResponse).to.have.property('name', userToBeCreated.name);
      expect(userCreateResponse).to.have.property('email', userToBeCreated.email);
      expect(userCreateResponse).to.have.property('gender', userToBeCreated.gender);
      expect(userCreateResponse).to.have.property('status', userToBeCreated.status);
    });

    // Data driven tests
    const testScenarios = [
      'John',
      'John Doe',
      'VeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVeryVery Long name',
      "Name with '",
      'Name with #',
    ];

    testScenarios.forEach(function (name) {
      it(`Can create users with different names: ${name}`, async () => {
        const payload = {
          ...factory.user(),
          name,
        };
        const userCreateResponse = await api.createUser(payload);

        expect(userCreateResponse).to.have.property('name', name);
      });
    });

    // Alternatively you can add expected results when creating arrays for data driven tests
    // let validationErrors = [
    //   {
    //     email: "",
    //     expectedErrorMessage: 422 - { "meta": null, "data": [{ "field": "email", "message": "is invalid" }] }
    //   },
    //   {
    //     name: "",
    //     expectedErrorMessage: 422 - { "meta": null, "data": [{ "field": "name", "message": "is invalid" }] }
    //   }
    // ]

    it('Can create new user by using factory and overriding an existing property from factory (POST /users)', async function () {
      // Using spread operator, you can create new object, add factory generated
      // user to it and add or override properties of this new object
      const userToBeCreated = {
        ...factory.user(),
        name: 'Mike', // Since factory already has "name" property, this will override it
        address: 'My address', // If "address" is not in the object, coming from factory.user(), this will add it
      };

      const userCreateResponse = await api.createUser(userToBeCreated);

      expect(userCreateResponse).to.have.property('id').that.is.a('number');
      expect(userCreateResponse).to.have.property('name', userToBeCreated.name);
      expect(userCreateResponse).to.have.property('email', userToBeCreated.email);
      expect(userCreateResponse).to.have.property('gender', userToBeCreated.gender);
      expect(userCreateResponse).to.have.property('status', userToBeCreated.status);
    });

    it('Can create multiple users in parallel (POST /users', async () => {
      const userToBeCreated1 = {
        ...factory.user(),
        name: `User 1 (${factory.randomString()})`,
      };

      const userToBeCreated2 = {
        ...factory.user(),
        name: 'User 2',
      };

      const userToBeCreated3 = {
        ...factory.user(),
        name: 'User 3',
      };

      const myUserArray = await Promise.all([
        api.createUser(userToBeCreated1),
        api.createUser(userToBeCreated2),
        api.createUser(userToBeCreated3),
      ]);

      // Or simplify it without creating variables:
      // const myUserArray = await Promise.all([
      //   api.createUser(factory.user()),
      //   api.createUser(factory.user()),
      //   api.createUser(factory.user()),
      //   api.createUser(factory.user()),
      //   api.createUser(factory.user()),
      // ]);

      myUserArray.forEach((user) => {
        expect(user).to.have.property('email').that.is.a('string');
        expect(user).to.have.property('id').that.is.a('number');
        expect(user).to.have.property('status').that.is.a('string');
        expect(user).to.have.property('gender').that.is.a('string');
      });
    });

    it('Error returned when creating a user and email is sent in incorrect format', async function () {
      const body = {
        ...factory.user(),
        email: 'example.com',
      };

      const err = await guard(async () => api.createUser(body));

      expect(err).to.have.property('statusCode', 422);
      expect(err.message).to.deep.equal('422 - [{"field":"email","message":"is invalid"}]');
    });

    it('Error returned when creating a user and required user properties are missing from the request (POST /users)', async () => {
      const userToBeCreated = {};

      const err = await guard(async () => api.createUser(userToBeCreated));

      expect(err).to.be.an.instanceOf(Error);
      expect(err).to.have.property('statusCode', 422);

      const expectedResultsArray = [
        {
          field: 'email',
          message: "can't be blank",
        },
        {
          field: 'name',
          message: "can't be blank",
        },
        {
          field: 'gender',
          message: "can't be blank",
        },
        {
          field: 'status',
          message: "can't be blank",
        },
      ];
      expect(err.error).to.be.an('array').that.deep.equals(expectedResultsArray);
    });
  });

  describe('GoRest Get users list (GET /users)', () => {
    it('Can get a list of users (GET /users)', async () => {
      const response = await api.getUsersList();
      expect(response).to.be.an('array').that.has.lengthOf(20);
    });

    it('Can filter a list of users by name (GET /users?name=varma)', async () => {
      const userToBeCreated = factory.user();

      await api.createUser(userToBeCreated);

      const response = await api.getUsersList({
        name: userToBeCreated.name,
      });

      expect(response).to.be.an('array').that.has.lengthOf(1);
    });

    it('Can search for users by multiple properties at the same time (GET /users?prop=value)', async () => {
      const requestBody = {
        ...factory.user(),
        name: 'Matthew',
      };
      await api.createUser(requestBody);

      const usersResponse = await api.getUsersList({ email: factory.qaPrefix, name: 'Matthew' });

      expect(usersResponse).to.have.lengthOf(1);
    });

    it('Can search for users by different user properties (GET /users?prop=value)', async function () {
      const userToBeCreated1 = {
        name: 'Brian J Ratke123',
        gender: 'Male',
        email: `${factory.qaPrefix}+myUserSearchTest${factory.randomString()}@example.com`,
        status: 'Active',
      };
      const userToBeCreated2 = {
        name: 'Melissa123 Ratke123',
        gender: 'Female',
        email: `${factory.qaPrefix}+myUserSearchTest${factory.randomString()}@example.com`,
        status: 'Active',
      };
      await Promise.all([
        api.createUser(userToBeCreated1),
        api.createUser(userToBeCreated2),
        api.createUser(factory.user()), // Let's create one extra user just in case
      ]);

      // Making get requests in parallel
      const [response1, response2, response3] = await Promise.all([
        api.getUsersList({ email: 'myUserSearchTest' }),
        api.getUsersList({ name: 'Ratke123' }),
        api.getUsersList({ name: 'Melissa123' }),
      ]);

      expect(response1).to.be.an('array').that.has.length(2);
      expect(response2).to.be.an('array').that.has.length(2);
      expect(response3).to.be.an('array').that.has.length(1);

      // You can find particular user objects in your response array to perform additional assertions:
      // const user1 = response1.find(u => u.name === userToBeCreated1.name);
    });
  });

  describe('GoRest Update users (PUT /users/{:id})', () => {
    it('Can update user by ID (slow)', async () => {
      const userToBeCreated = factory.user();

      const userCreatedResponse = await api.createUser(userToBeCreated);

      const userToBeUpdated = {
        name: 'John Doe',
        gender: 'female',
        email: `${factory.qaPrefix}${factory.randomString()}@example.com`,
        status: 'inactive',
      };

      const updatedUser = await api.updateUser(userCreatedResponse.id, userToBeUpdated);

      // JSON Schema validation
      validateSchema('updateUser', updatedUser);

      expect(updatedUser).to.have.property('name', userToBeUpdated.name);
      expect(updatedUser).to.have.property('gender', userToBeUpdated.gender);
      expect(updatedUser).to.have.property('email', userToBeUpdated.email);
      expect(updatedUser).to.have.property('status', userToBeUpdated.status);

      // Another way to check the result is to build an expected result object and then compare compare it to the actual result objectnm 90
      // const expectedUserUpdated = {
      //   ...userToBeUpdated,
      //   updated_at: factory.today,
      //   updated_by: "admin"
      // }

      // expect(updatedUser).to.deep.equal(expectedUserUpdated)
    });
  });

  describe('GoRest Delete users by ID (POST /users/{:id})', () => {
    it('Can Delete user by ID', async () => {
      const userCreatedResponse = await api.createUser(factory.user());

      const deleteResponse = await api.deleteUser(userCreatedResponse.id, true);
      expect(deleteResponse).to.have.property('statusCode', 204);
    });

    it('Error returned when deleting an already deleted user (DELETE /users/:id)', async () => {
      const createdUserResponse = await api.createUser(factory.user());
      await api.deleteUser(createdUserResponse.id);
      const err = await guard(async () => api.deleteUser(createdUserResponse.id));

      expect(err).to.have.property('statusCode', 404);
      expect(err.error).to.deep.equal({
        message: 'Resource not found',
      });
    });
  });

  describe('GoRest Get single user by ID (POST /users/{:id})', () => {
    it('Can get single user by ID', async () => {
      const userCreateResponse = await api.createUser(factory.user());
      const getUserResponse = await api.getUser(userCreateResponse.id);

      expect(getUserResponse, "User object when getting by ID doesn't match expected").to.deep.equal(userCreateResponse);
    });

    // have to use function declaration to allow access to mocha settings, i.e. this.timeout()
    it('Can get single user by ID with up to 10 retires', async function () {
      // since this take may take more than usual with all these retries, I'm increasing
      // the timeout to 20 seconds
      this.timeout(20000);
      const userCreateResponse = await api.createUser(factory.user());

      await retry(async () => {
        const getUserResponse = await api.getUser(userCreateResponse.id); // Assume this may fail for a few times before this request is successful

        expect(getUserResponse).to.deep.equal(userCreateResponse);
      });
    });

    // have to use function declaration to allow access to mocha settings, i.e. this.timeout()
    it('Create new users, retry up to 20 times with custom retry interval and get single user by ID', async function () {
      this.timeout(22000);

      const generatedUser = {
        ...factory.user(),
      };

      const userCreateResponse = await api.createUser(generatedUser);

      await retry(async () => {
        const getUserResponse = await api.getUser(userCreateResponse.id); // Assume this may fail for a few times before this request is sucessfull

        expect(getUserResponse).to.deep.equal(userCreateResponse);
      }, {
        // Below is optional retries settings, # of retries and interval between them can be adjusted
        retries: 20,
        interval: 1000,
      });
    });

    it('Create new users, wait 30 seconds and get single user by ID (slow)', async function () {
      this.timeout(32000);

      const generatedUser = {
        ...factory.user(),
      };
      const userCreateResponse = await api.createUser(generatedUser);

      // Wait 2 seconds using wait() function we created previously
      // Note, this is not needed for the test and it's here just for demonstration purposes
      await wait(30000);

      const getUserResponse = await api.getUser(userCreateResponse.id);

      expect(getUserResponse).to.deep.equal(userCreateResponse);
    });

    it('Error returned when getting a user that has been deleted');
  });
});
