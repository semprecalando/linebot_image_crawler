export const handler = async (event: any = {}): Promise<any> => {

  return await { statusCode: 200, body: 'hello world!' };
};