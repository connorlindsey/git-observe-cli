const GET_USER = `
{
  viewer { 
    login
    name
    repositoriesContributedTo(first:3) {
      edges {
        node{
          name
        }
      }
    }
  }
}
`
const GET_REPO = ``

export { GET_USER, GET_REPO }
