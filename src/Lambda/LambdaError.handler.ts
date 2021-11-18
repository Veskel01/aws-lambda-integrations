import { HttpStatus } from '@nestjs/common';

import { ProxyResult } from 'aws-lambda';

import { DateTime } from 'luxon';

type ErrorResponseType = {
  statusCode: HttpStatus;
  message: string;
  path: string;
};

const LambdaErrorHandler = ({
  message,
  path,
  statusCode,
}: ErrorResponseType): ProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': `${process.env.AMPLIFY_URL}`,
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      statusCode,
      message,
      path,
      date: DateTime.local().toFormat('dd/LL/yyyy HH:mm:ss'),
    }),
  };
};

export default LambdaErrorHandler;
