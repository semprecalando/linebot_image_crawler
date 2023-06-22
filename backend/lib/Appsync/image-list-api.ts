import * as path from 'path';
import { Stack } from "aws-cdk-lib";
import { GraphqlApi, MappingTemplate, SchemaFile } from 'aws-cdk-lib/aws-appsync';

export const createGraphqlAPI = (stack: Stack) => {
  const api = new GraphqlApi(stack, 'GraphQLApi', {
    name: 'image-crawler-api',
    schema: SchemaFile.fromAsset(path.join(__dirname, 'schema.graphql'))
  });

  const chatDataSource = api.addNoneDataSource('chatDataSource');

  chatDataSource.createResolver('publishResolver', {
    typeName: 'Mutation',
    fieldName: 'publish',
    requestMappingTemplate: MappingTemplate.fromFile(path.join(__dirname, 'notificateRequest.vtl')),
    responseMappingTemplate: MappingTemplate.fromString('$util.toJson($context.result)'),
  });
  return api;
}