import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    )
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://electricmall.com.ng/graphql',
})

const apolloClient = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache({
    // Tell Apollo which concrete types implement abstract interfaces.
    // Without this, Apollo 3 uses heuristic matching and product.slug
    // can come back as undefined for SimpleProduct / VariableProduct nodes.
    possibleTypes: {
      Product: ['SimpleProduct', 'VariableProduct', 'ExternalProduct', 'GroupProduct'],
      ProductUnion: ['SimpleProduct', 'VariableProduct', 'ExternalProduct', 'GroupProduct'],
      Node: ['SimpleProduct', 'VariableProduct', 'ExternalProduct', 'GroupProduct', 'ProductCategory'],
    },
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['where'],
            merge(existing, incoming) {
              if (!existing) return incoming
              return {
                ...incoming,
                nodes: [...(existing.nodes || []), ...(incoming.nodes || [])],
              }
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
  },
})

export default apolloClient
