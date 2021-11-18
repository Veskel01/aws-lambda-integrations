import { HttpStatus } from '@nestjs/common';

import { ProxyResult } from 'aws-lambda';

type ArgumentsType = {
  statusCode: HttpStatus;
  body: unknown;
} & Omit<ProxyResult, 'statusCode' | 'body'>;

const LambdaResponse = ({
  statusCode,
  body,
  headers,
  ...rest
}: ArgumentsType): ProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': `${process.env.AMPLIFY_URL}`,
      'Access-Control-Allow-Credentials': true,
      ...headers,
    },
    body: JSON.stringify(body),
    ...rest,
  };
};

export default LambdaResponse;
