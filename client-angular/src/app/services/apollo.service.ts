import { Injectable, effect } from '@angular/core';
import { ApolloLink, createHttpLink, concat } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';
import { AuthService } from './auth.service';
import { HttpLink } from 'apollo-angular/http';

const uri = 'http://localhost:9000/graphql'; // <-- add the URL of the GraphQL server here

const jobDetailFragment = gql`
    fragment jobDetail on Job {
        id,
        title,
        description
        date
        company {
            id
            name
        }
    }
`

const getJobByIdQuery = gql`
    query JobById($id: ID!) {
        job(id: $id) {
            ...jobDetail
        }
    }
    ${jobDetailFragment}
`;

const companyByIdQuery = gql`
    query CompanyById($id: ID!) {
        company(id: $id) {
            id,
            name
            description
            jobs {
                id
                title
                date
            }
        }
    }
    `;

const getJobsQuery = gql`    
query Jobs($limit: Int, $offset: Int) {
  jobs(limit: $limit, offset: $offset) {
    jobs {
      id
        date
        title
        company {
          id
          name
        }
    },
    totalCount
  }
}
`;

@Injectable({
  providedIn: 'root'
})
export class ApolloService {

  constructor(private apollo: Apollo,
              private authService: AuthService,
              private httpLink: HttpLink) {

                effect(() => {
                  console.log('[ApolloService]',this.authService.token());
                  this.configureApollo(this.authService.token());
                });
  }

  private configureApollo(token: string): void {
    console.log('Configuring Apollo with token', token);

    const httpLink = createHttpLink({ uri });

    const authLink = new ApolloLink((operation, forward) => {
      // Use the setContext method to set the HTTP headers.
      if (token) {
        operation.setContext({
            headers: { authorization: `Bearer ${token}` }
        });
      }
      return forward(operation);
    });
    
    const link = concat(authLink, httpLink);

    this.apollo.client.setLink(link);
  }     
    

  public async getJobs(limit:number, offset:number) {
    let response = await this.apollo.watchQuery({ query: getJobsQuery , variables: {limit, offset}, fetchPolicy: 'network-only'}).result();
    return response;
  }

  public async getJobById(id:string) {
    let response = await this.apollo.watchQuery({ query: getJobByIdQuery, variables: { id } }).result()
    return response;
  }

  public async getCompanyById(id:string) {
    let response = await this.apollo.watchQuery({ query: companyByIdQuery, variables: { id } }).result()
    return response;
  }

  public async updateJob(id:string, input:any) {
    const mutation = gql`
    mutation UpdateJob($id: ID!, $input: createJobInput!) {
        job: updateJob(id: $id, input: $input) {
            ...jobDetail
        }
    }
    ${jobDetailFragment}
    `;

    const response = await this.apollo.client.mutate({
        mutation, 
        variables: { id, input },
        update: (cache, {data}:any) => {
            console.log('update from response', data);
            cache.writeQuery({
                query: getJobByIdQuery,
                variables: { id: data.job.id },
                data
            })
        }
    });
    return response;
  }

  
  public async createJob(input:any) {
    const mutation = gql`
    mutation CreateJob($input: createJobInput!) {
        job: createJob(input: $input) {
            ...jobDetail
        }
    }
    ${jobDetailFragment}
    `;

      const response = await this.apollo.client.mutate({
          mutation, 
          variables: { input },
          update: (cache, {data}:any) => {
              console.log('update from response', data);
              cache.writeQuery({
                  query: getJobByIdQuery,
                  variables: { id: data.job.id },
                  data
              })
          }
      });
      return response;
  }

  public async deleteJob(id:string) {
    const mutation = gql`
    mutation DeleteJob($id: ID!) {
        job: deleteJob(id: $id) {
            id
        }
    }
    `
    const { data }:any = await this.apollo.client.mutate({
        mutation, 
        variables: { id }
    });
    return data.job;
  }
}