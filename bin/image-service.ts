#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ImageServiceStack } from '../lib/image-service-stack';

const app = new cdk.App();
new ImageServiceStack(app, 'TimeImageServiceStack', {
  env: {
    region: 'eu-west-1'
  }
});
