const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 1000,
    equity: .5,
    company_handle: 1,
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'new'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 1000,
        equity: .5,
        company_handle: 1,
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newjob);
      await Job.create(newjob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "j1",
        salary: 1000,
        equity: 0,
        company_handle: 2,
      },
      {
        title: "j2",
        salary: 2000,
        equity: 1,
        company_handle: 1,
      },      
    ]);
  });
});

/************************************** findSome  */
describe("findSome", function () {
  test("works: full filter", async function () {
    let companies = await Company.findSome({'title': 'j1', 'salary': 1, 'equity': 0});
    expect(companies).toEqual([
      {
        title: "j1",
        salary: 1000,
        equity: 0,
        company_handle: 2,
      }
    ]);
  });
  test('works: partial filter', async function (){
    let companies = await Company.findSome({ 'salary': 1});
    expect(companies).toEqual([
      {
        title: "j1",
        salary: 1000,
        equity: 0,
        company_handle: 2,
      },
      {
        title: "j2",
        salary: 2000,
        equity: 1,
        company_handle: 1,
      },      
    ]);
  
  })
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get("c1");
    expect(job).toEqual({
      title: "j1",
        salary: 1000,
        equity: 0,
        company_handle: 2,
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    
    salary: 10,
    equity: .5,
  };

  test("works", async function () {
    let job = await Job.update("j1", updateData);
    expect(company).toEqual({
      title: "j1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT title, salary, equity
           FROM jobs
           WHERE handle = 'j1'`);
    expect(result.rows).toEqual([{
      title: "j1",
      salary: 10,
      equity: .5
    }]);
  });

  

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("j1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("j1");
    const res = await db.query(
        "SELECT title FROM jobs WHERE handle='j1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
