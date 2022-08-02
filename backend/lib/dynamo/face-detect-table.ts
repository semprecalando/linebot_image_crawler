import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export const createFaceDetectTable = (stack: Stack) => {
  const table = new Table(
    stack,
    "faceDetectTable",
    {
      partitionKey: {
        name: "imageName",
        type: AttributeType.STRING
      },
      tableName: 'faceDetectTable',
      removalPolicy: RemovalPolicy.DESTROY
    },
  );
  return table;
}
