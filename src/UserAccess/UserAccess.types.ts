import { DynamoDbUserType } from '../DynamoDB/Dynamo.types';

export type AddUserAccess = Pick<
  DynamoDbUserType['properties'],
  'isAdmin' | 'access_type'
> & { githubName: string; accessToken: string };

export type AccessKeysType =
  | 'mentors'
  | 'students'
  | 'summary'
  | 'questionnaires'
  | 'roadmaps'
  | 'full_access';
