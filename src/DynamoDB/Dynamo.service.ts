import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// aws
import * as AWS from 'aws-sdk';

// errors
import { DynamoDbException } from '../CustomErrors/Dynamo.errors';

// types
import {
  GetFromDynamoType,
  SaveIntoDynamoType,
  UpdateDynamoObjectType,
} from './Dynamo.types';

@Injectable()
export class DynamoService {
  private readonly dynamoClient: AWS.DynamoDB.DocumentClient;

  constructor(private readonly configService: ConfigService) {
    this.dynamoClient = new AWS.DynamoDB.DocumentClient({
      credentials: {
        accessKeyId: configService.get<string>('AWS_DYNAMO_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_DYNAMO_SECRET_KEY'),
      },
      region: configService.get<string>('REGION'),
    });
  }

  public async get<T>({
    tableName,
    primaryKey,
    ...config
  }: GetFromDynamoType<T>): Promise<{
    response: T | null;
    ConsumedCapacity: AWS.DynamoDB.ConsumedCapacity;
  }> {
    try {
      const { Item, ConsumedCapacity } = await this.dynamoClient
        .get({
          Key: {
            ...primaryKey,
          },
          TableName: tableName,
          ...config,
        })
        .promise();

      const response = Item ? (Item as T) : null;

      return {
        response,
        ConsumedCapacity,
      };
    } catch (e) {
      throw new DynamoDbException();
    }
  }

  public async insert<T>({
    tableName,
    data,
    primaryKey,
    ...config
  }: SaveIntoDynamoType): Promise<T | null> {
    try {
      const { $response } = await this.dynamoClient
        .put({
          TableName: tableName,
          Item: {
            ...primaryKey,
            ...data,
          },
          ...config,
        })
        .promise();
      return config.ReturnValues ? ($response.data as T) : null;
    } catch (e) {
      throw new DynamoDbException();
    }
  }

  public async update<T extends Record<string, unknown>>({
    primaryKey,
    tableName,
    ...config
  }: UpdateDynamoObjectType<T>) {
    try {
      const { Attributes } = await this.dynamoClient
        .update({
          TableName: tableName,
          Key: {
            ...primaryKey,
          },
          ...config,
        })
        .promise();
      return Attributes as T;
    } catch (e) {
      console.log(e);
      throw new DynamoDbException();
    }
  }
}
