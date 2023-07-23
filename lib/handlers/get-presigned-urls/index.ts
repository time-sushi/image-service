import Joi from 'joi';
import S3 from 'aws-sdk/clients/s3';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { apiResponse, appConfigs } from '../../helpers';
import { v4 } from 'uuid';

enum FileType {
  PNG = 'image/png',
  JPG = 'image/jpeg'
}

interface Body {
  key: string;
  type: FileType;
}

const schema = Joi.object<Body>({
  type: Joi.string()
    .valid(...Object.values(FileType))
    .required()
});

const s3 = new S3({
  region: 'eu-west-1',
  apiVersion: '2006-03-01'
});

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const body: Body = JSON.parse(event.body || '{}');
    const { error } = schema.validate(body, { abortEarly: false });

    if (error) {
      return apiResponse(400, {
        message: 'Invalid Request.',
        statusCode: 400,
        error
      });
    }

    const Key = `${v4()}.${body.type === 'image/png' ? 'png' : 'jpg'}`;

    const params = {
      Bucket: appConfigs.BUCKET_NAME,
      Expires: appConfigs.PRESIGNED_URL_TTL,
      Key,
      ContentType: body.type
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    return apiResponse(200, {
      message: 'OK',
      statusCode: 200,
      data: {
        url,
        key: Key
      }
    });
  } catch (error) {
    return apiResponse(501, {
      message: 'ERROR',
      statusCode: 501
    });
  }
};
