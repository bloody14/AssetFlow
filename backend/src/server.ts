import app from './app';
import 'dotenv/config';
import { logger } from './shared/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`AssetFlow API is running on port ${PORT}`, {
    operation: 'ServerStartup',
    module: 'System',
  });
});
