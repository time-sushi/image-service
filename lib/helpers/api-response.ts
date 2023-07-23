import { APIGatewayProxyResult } from 'aws-lambda';

interface Body {
  message: string;
  statusCode: number;
  data?: any;
  details?: any;
  error?: any;
}

export const apiResponse = (
  statusCode: number,
  body: Body
): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE'
    }
  };
};
