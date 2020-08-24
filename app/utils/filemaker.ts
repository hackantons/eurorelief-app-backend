import fetch from 'node-fetch';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const FM_HOST = String(process.env.FM_HOST) || '';
const FM_DBNAME = String(process.env.FM_DBNAME) || '';
const FM_DBLAYOUT = String(process.env.FM_DBLAYOUT) || '';
const FM_USER = String(process.env.FM_USER) || '';
const FM_PASSWORD = String(process.env.FM_PASSWORD) || '';

const getLoginToken = async (): Promise<string> => {
  try {
    const res = await fetch(
      `${FM_HOST}/fmi/data/v1/databases/${FM_DBNAME}/sessions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Basic ' +
            Buffer.from(FM_USER + ':' + FM_PASSWORD).toString('base64'),
        },
      }
    );
    const resJSON = await res.json();
    return resJSON.response.token;
  } catch (e) {
    throw new Error('Request Token failed');
  }
};

export const resolveId = async (regNumber: string): Promise<string> => {
  try {
    const token = await getLoginToken();
    const res = await fetch(
      `${FM_HOST}/fmi/data/v1/databases/${FM_DBNAME}/layouts/${FM_DBLAYOUT}/_find`,
      {
        method: 'POST',
        body: JSON.stringify({
          query: [{ 'CONTACTS::RegistrationNumber': regNumber }],
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const resJSON = await res.json();
    const records = resJSON.response.data;
    const record = records[records.length - 1];
    return record.recordId;
  } catch (e) {
    throw new Error('Registration number could not be resolved');
  }
};

export const setPhoneNumberAdded = async (
  record: string,
  added: boolean
): Promise<number> => {
  try {
    const token = await getLoginToken();
    const res = await fetch(
      `${FM_HOST}/fmi/data/v1/databases/${FM_DBNAME}/layouts/${FM_DBLAYOUT}/records/${record}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          fieldData: {
            IsPhoneNumberAdded: added ? 'true' : 'false',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const resJSON = await res.json();
    return resJSON.response.modId || 0;
  } catch (e) {
    return 0;
  }
};
