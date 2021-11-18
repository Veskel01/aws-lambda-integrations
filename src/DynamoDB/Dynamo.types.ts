import { DynamoDB } from 'aws-sdk';

import { AccessKeysType } from '../UserAccess/UserAccess.types';

export const enum DynamoModuleProviders {
  DYNAMO_SERVICE = 'dynamo_service',
}

type DynamoDefaultGetTypes<T> = {
  AttributesToGet?: Array<keyof T extends string ? keyof T : string>;
} & Omit<DynamoDB.GetItemInput, 'Key' | 'TableName' | 'AttributesToGet'>;

type BaseArgsType = {
  tableName: string;
  primaryKey: Record<string, unknown>;
};
export type GetFromDynamoType<T> = BaseArgsType & DynamoDefaultGetTypes<T>;

type DynamoDefaultSaveType = {
  ReturnValues?: 'ALL_OLD' | 'NONE';
} & Omit<
  DynamoDB.DocumentClient.PutItemInput,
  'ReturnValues' | 'Item' | 'TableName'
>;

export type SaveIntoDynamoType = {
  data: Record<string, unknown>;
} & BaseArgsType &
  DynamoDefaultSaveType;

type DynamoDefaultUpdateType<T> = {
  primaryKey: Partial<Record<keyof T, unknown>>;
  tableName: string;
  ReturnValues: 'ALL_NEW' | 'UPDATED_OLD' | 'UPDATED_NEW' | 'ALL_OLD' | 'NONE';
};

export type UpdateDynamoObjectType<T> = DynamoDefaultUpdateType<T> &
  Omit<
    DynamoDB.DocumentClient.UpdateItemInput,
    'Key' | 'TableName' | 'ReturnValues'
  >;

export type DynamoDbUserType = {
  github_name: string;
  properties: {
    id: string;
    isAdmin: boolean;
    created_at: string;
    access_type: AccessKeysType[];
    last_login_date: string | null;
    refresh_token: string | null;
    last_token_refresh_date: string | null;
  };
};
