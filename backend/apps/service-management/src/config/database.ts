import { createDatabaseConnectionFromUrl } from '../../../../libs/common/src/utils/dbFactory';
import dotenv from 'dotenv';
dotenv.config();

export const dbServiceManagement = createDatabaseConnectionFromUrl(
    process.env.DB_MANAGEMENT_URL,
    {
        dbName: 'db_management',
        dbUser: 'postgres',
        dbPass: 'postgres_pass',
        dbHost: 'db_management', 
        dbPort: 5432,
    },
);