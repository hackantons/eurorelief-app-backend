import AWS from 'aws-sdk';

AWS.config.region = process.env.AWS_REGION || '';

export const sendSMS = (
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; resp: any }> =>
  new Promise((resolve, reject) => {
    const sns = new AWS.SNS();
    sns.publish(
      {
        Message: message,
        MessageStructure: 'string',
        PhoneNumber: phoneNumber.replace('+', ''),
        Subject: 'Eurorelief notification',
      },
      (err, data) => {
        if (err) {
          resolve({
            success: false,
            resp: err,
          });
        } else {
          resolve({
            success: true,
            resp: data,
          });
        }
      }
    );
  });
