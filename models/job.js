"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

/** Related functions for jobs */

class Jobs{
    /** Create a job (from data), update db, return new job data.
   *
   * data should be { id, title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle  }
   *
   * Throws BadRequestError if job already in database.
   * */

    static async create({ id, title, salary, equity, company_handle }) {
        const duplicateCheck = await db.query(
              `SELECT id
               FROM jobs
               WHERE id = $1`,
            [id]);
    
        if (duplicateCheck.rows[0])
          throw new BadRequestError(`Duplicate job: ${id}`);
    
        const result = await db.query(
              `INSERT INTO jobs
               (id, title, salary, equity, company_handle)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id, title, salary, equity, company_handle"`,
            [
              id,
              title,
              salary,
              equity,
              company_handle
            ],
        );
        const job = result.rows[0];
    
        return job;

      }


    /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           ORDER BY name`);
    return jobsRes.rows;
  }

  static async findSome(filter) {
    if (title in filter){
        const title = filter[title]
      if (salary in filter){ 
          const salary = filter[salary]
          
        if (equity in filter){
          let equity = filter[eqity]
          const jobsRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle
             FROM jobs
             WHERE title ILIKE $1
             WHERE salary >= $2
            WHERE equity >= 0
             ORDER BY title`, [title,  salary, equity]);
      return jobsRes.rows;
        }
      else{
        const jobsRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE title ILIKE $1
           WHERE salary >= $2
           WHERE equity === 0
           ORDER BY title`, [title,  salary]);
    return jobsRes.rows;
      }
      
      }  
      else{
        const jobsRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE title ILIKE $1
           WHERE equity === 0
           ORDER BY title`, [title]);
    return jobsRes.rows;
      }
    }  
  }


/** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *  
   *
   * Throws NotFoundError if not found.
   **/

static async get(id) {
    const jobRes = await db.query(
        `SELECT id,
                title,
                salary,
                equity,
                company_handle
            FROM jobs
            WHERE id = 1$
            ORDER BY name`
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }


/** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, minSalary, equity}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          title: "title",
          salary: "salary",
          equity: "equity"
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, handle]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }


  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Jobs;


