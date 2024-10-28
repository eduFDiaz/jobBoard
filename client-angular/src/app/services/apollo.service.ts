import { Injectable, effect } from '@angular/core';
import { ApolloLink, createHttpLink, concat } from '@apollo/client/core';
import { Apollo, gql } from 'apollo-angular';
import { AuthCognitoService } from './auth.cognito.service';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../environments/environment';

const uri = environment.GRAPHQL_URL;

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
query Jobs($limit: Int, $startKey: ExclusiveStartKeyInput) {
  jobs(limit: $limit, startKey: $startKey) {
    jobs {
      id
      title
      date
      company {
        id
        name
      }
    }
    lastKey {
      PK
      SK
      GSI1PK
      GSI1SK
    }
    count
  }
}
`;

const getCompaniesQuery = gql`
  query Companies {
    companies {
      name
      description
      id
    }
  }
`;

const getCompaniesByNameQuery = gql`
  query Companies($name: String!) {
    searchCompany(name: $name) {
      id
      name
      description
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ApolloService {

  constructor(private apollo: Apollo,
              private authService: AuthCognitoService) {

                effect(() => {
                  console.log('[ApolloService]',this.authService.accessToken());
                  this.configureApollo(this.authService.accessToken());
                });
  }

  private configureApollo(token: string): void {
    console.log('Configuring Apollo with token', token);

    const httpLink = createHttpLink({ uri });

    const authLink = new ApolloLink((operation, forward) => {
      // Use the setContext method to set the HTTP headers.
      if (token) {
        operation.setContext({
            headers: { authorization: `${token}` }
        });
      }
      return forward(operation);
    });
    
    const link = concat(authLink, httpLink);

    this.apollo.client.setLink(link);
  }     
    

  public async getJobs(limit:number, startKey: any) {
    let response = await this.apollo.watchQuery({ query: getJobsQuery , variables: {limit, startKey}, fetchPolicy: 'network-only'}).result();
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

  public async getCompanies() {
    let response = await this.apollo.watchQuery({ query: getCompaniesQuery }).result()
    return response;
  }

  public async searchCompanies(name:string) {
    let response = await this.apollo.watchQuery({ query: getCompaniesByNameQuery, variables: { name } }).result()
    return response;
  }

  public async createCompany(input:any) {
    const mutation = gql`
    mutation CreateCompany($input: createCompanyInput!) {
        company: createCompany(input: $input) {
            id
            name
            description
        }
    }
    `;

    const response = await this.apollo.client.mutate({
        mutation, 
        variables: { input }
    });
    return response;
  }

  public getUserById(id:string) {
    const query = gql`
    query UserById($id: ID!) {
      userById(id: $id) {
        id
        email
        name
        companyId
      }
    }
    `;

    return this.apollo.watchQuery({ query, variables: { id } }).result();
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