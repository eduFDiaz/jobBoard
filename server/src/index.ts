import app from './app';

const PORT = process.env.PORT || 9001;

app.listen({ port: PORT }, () => {
  /* eslint-disable no-console */
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL server running at http://localhost:${PORT}/graphql`);
  /* eslint-enable no-console */
});
