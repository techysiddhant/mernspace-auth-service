import app from './app';
import { Config } from './config';

const startServer = () => {
    try {
        app.listen(Config.PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Listing on PORT ${Config.PORT}`);
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
    }
};
startServer();
