import app from './app';
import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection established');
        app.listen(Config.PORT, () => {
            logger.info(`Listing on PORT ${Config.PORT}`);
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};
void startServer();
