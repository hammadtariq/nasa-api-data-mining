import { MongoClient } from 'mongodb';
import Model from './model';
import Config from '../controllers/config.controller';

let DB;

class Db {
	ActiveJobs: Model;

	async connect() {
		if (!DB) {
			DB = await MongoClient.connect(Config.instance.databaseUrl);
			this.ActiveJobs = new Model(DB, 'activeJobs');
		}
	}
};

const db = new Db();
export default db;