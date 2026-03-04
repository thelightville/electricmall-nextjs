import { gql } from '@apollo/client'

// ─── Product Fragments ────────────────────────────────────────────────────────

const PRODUCT_CARD_FIELDS = gql`
  fragment ProductCardFields on Product {
    id
    databaseId
    name
    slug
    image {
      sourceUrl
      altText
    }
    ... on SimpleProduct {
      price
      regularPrice
      salePrice
      stockStatus
    }
    ... on VariableProduct {
      price
      regularPrice
    }
  }
`

// ─── Products List ────────────────────────────────────────────────────────────

export const GET_PRODUCTS = gql`
  ${PRODUCT_CARD_FIELDS}
  query GetProducts($first: Int, $after: String, $category: String, $search: String) {
    products(
      first: $first
      after: $after
      where: {
        category: $category
        search: $search
        status: "publish"
        orderby: { field: DATE, order: DESC }
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...ProductCardFields
      }
    }
  }
`

export const GET_FEATURED_PRODUCTS = gql`
  ${PRODUCT_CARD_FIELDS}
  query GetFeaturedProducts($first: Int) {
    products(
      first: $first
      where: { featured: true, status: "publish", orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...ProductCardFields
      }
    }
  }
`

export const GET_SALE_PRODUCTS = gql`
  ${PRODUCT_CARD_FIELDS}
  query GetSaleProducts($first: Int) {
    products(
      first: $first
      where: { onSale: true, status: "publish", orderby: { field: DATE, order: DESC } }
    ) {
      nodes {
        ...ProductCardFields
      }
    }
  }
`

// ─── Single Product ───────────────────────────────────────────────────────────

export const GET_PRODUCT = gql`
  query GetProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      productCategories {
        nodes {
          id
          name
          slug
        }
      }
      related(first: 4) {
        nodes {
          id
          databaseId
          name
          slug
          image {
            sourceUrl
            altText
          }
          ... on SimpleProduct {
            price
            regularPrice
            salePrice
            stockStatus
          }
          ... on VariableProduct {
            price
            regularPrice
          }
        }
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
        stockStatus
        stockQuantity
      }
      ... on VariableProduct {
        price
        regularPrice
        variations {
          nodes {
            id
            databaseId
            name
            stockStatus
            stockQuantity
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`

export const GET_PRODUCT_SLUGS = gql`
  query GetProductSlugs($first: Int) {
    products(first: $first, where: { status: "publish" }) {
      nodes {
        slug
      }
    }
  }
`

// ─── Categories ───────────────────────────────────────────────────────────────

export const GET_CATEGORIES = gql`
  query GetCategories {
    productCategories(
      where: { parent: null, hideEmpty: true }
      first: 50
    ) {
      nodes {
        id
        name
        slug
        count
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`

export const GET_CATEGORY = gql`
  query GetCategory($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      count
      image {
        sourceUrl
        altText
      }
    }
  }
`

export const GET_CATEGORY_SLUGS = gql`
  query GetCategorySlugs {
    productCategories(where: { hideEmpty: true }, first: 100) {
      nodes {
        slug
      }
    }
  }
`

// ─── Customer / Auth ──────────────────────────────────────────────────────────

export const LOGIN_MUTATION = gql`
  mutation LoginUser($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      user {
        id
        databaseId
        name
        email
      }
    }
  }
`

export const REGISTER_MUTATION = gql`
  mutation RegisterUser($username: String!, $email: String!, $password: String!) {
    registerCustomer(
      input: { username: $username, email: $email, password: $password }
    ) {
      authToken
      refreshToken
      customer {
        id
        databaseId
        email
        firstName
        lastName
      }
    }
  }
`

export const GET_CUSTOMER = gql`
  query GetCustomer {
    customer {
      id
      databaseId
      email
      firstName
      lastName
      billing {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
        email
        phone
      }
      orders {
        nodes {
          id
          databaseId
          status
          total
          date
          lineItems {
            nodes {
              productId
              quantity
              total
              product {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`
