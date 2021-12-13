import {
  APIGatewayProxyEvent,
  Handler,
  APIGatewayProxyResult,
} from 'aws-lambda';

export type ProxyHandler = Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult | void
>;

import { AccessKeysType } from '../UserAccess/UserAccess.types';

export type UserAccessRequestBody = {
  githubName: string;
  accessKeys: AccessKeysType[];
  isAdmin: boolean;
};

export type PaymentPayload = {
  action: string;
  arg: number;
};
