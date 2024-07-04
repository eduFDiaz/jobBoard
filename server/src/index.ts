import app from './app';
import createLogger from './config/logger';
const logger = createLogger(__filename);

const PORT = process.env.PORT || 9001;

app.listen({ port: PORT }, () => {
  /* eslint-disable no-console */
  logger.info(`Server running on port ${PORT}`);
  logger.info(`GraphQL server running at http://localhost:${PORT}/graphql`);
  /* eslint-enable no-console */
});
