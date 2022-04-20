// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '1s1ierc33e'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-x92on9zg.us.auth0.com',            // Auth0 domain
  clientId: '98QLZHD7cKG3qUckNmJnNqrmtkkRF3jh',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
