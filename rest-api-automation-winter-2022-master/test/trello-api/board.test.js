const { expect } = require('chai');
const Api = require('../../src/TrelloApi');
const factory = require('../../src/factory/trello-factory');
const { validateSchema } = require('../../utils/json-schema/validate-schema');

describe('Boards API', () => {
  const api = new Api();

  const cleanUpBoards = async () => {
    const boards = await api.getBoardsListForMember();
    await Promise.all(boards.map((b) => api.deleteBoard(b.id)));
  };

  before(async () => {
    api.authenticate();
    await cleanUpBoards();
  });

  afterEach(async () => {
    await cleanUpBoards();
  });

  it('Can create new board by only passing required parameters (POST /boards)', async () => {
    const boardPayload = {
      name: `Test board ${factory.randomString()} (${factory.QA_PREFIX})`,
    };
    const board = await api.createBoard(boardPayload);

    validateSchema('createBoard', board);
    expect(board).to.have.property('id').that.has.lengthOf(24);
    expect(board).to.have.property('name', boardPayload.name);
    expect(board).to.have.property('desc', '');
    expect(board).to.have.property('closed', false);
    expect(board).to.have.property('pinned', false);
    expect(board).to.have.property('url').that.includes('https://trello.com/b/');
    expect(board).to.have.property('shortUrl').that.includes('https://trello.com/b/');
  });

  it('Can get a board by ID (GET /boards/:id)', async () => {
    const boardToBeCreated = factory.board();

    const boardCreated = await api.createBoard(boardToBeCreated);
    const gotBoard = await api.getBoard(boardCreated.id);
    delete boardCreated.limits; // As per requirement, it's expected that limits property is not returned from GET /boards/:id

    validateSchema('createBoard', gotBoard);
    expect(gotBoard).to.deep.equal(boardCreated);
  });

  it('Can get a list of boards for a member (GET /members/me/boards)', async () => {
    await Promise.all([
      api.createBoard(factory.board()),
      api.createBoard(factory.board()),
      api.createBoard(factory.board()),
    ]);

    const gotBoards = await api.getBoardsListForMember();
    expect(gotBoards).to.be.an('array').that.has.lengthOf(3);
  });
});
