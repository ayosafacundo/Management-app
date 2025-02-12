import { Pool, PoolConfig } from 'pg';
import { readFileSync } from 'fs';
import { Err, Ok, Result } from 'rustic';

const UserTables = readFileSync('./db/Tables/users.psql').toString();

export default class Database {
  private pool: Pool;
  constructor(poolParams?: PoolConfig) {
    this.pool = new Pool(poolParams);
  }

  public async safeQuery(query:string, inputs: string[]): Promise<Result<any[], string>> {
    const client = await this.pool.connect();
    let ans;
    try {
      await client.query("BEGIN")
      ans = await client.query(query, inputs);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      return Err(""+err);
    }
    client.release();
    return Ok(ans.rows);
  }

  public async createDB() {
    await this.pool.query(`DO $$ 
      DECLARE 
          r RECORD;
      BEGIN 
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP; 
      END $$;`)
    this.createUsers();
  }

  private async createUsers() {
    try {
      this.pool.query(`
        CREATE OR REPLACE FUNCTION update_updatedat_column()  
        RETURNS TRIGGER AS $$  
        BEGIN  
            NEW.updatedat = CURRENT_TIMESTAMP;  
            RETURN NEW;  
        END;  
        $$ LANGUAGE plpgsql;`);
      this.pool.query(UserTables);
    } catch (err) {
      console.error(err);
    }
  } 

}
