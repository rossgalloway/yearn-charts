import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://kong.yearn.farm/api/gql',
  cache: new InMemoryCache(),
});

export default client;