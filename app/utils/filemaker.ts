import fetch from 'node-fetch';
import { log, logLevels } from './log';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const FM_HOST = String(process.env.FM_HOST || '');
const FM_DBNAME = String(process.env.FM_DBNAME || '');
const FM_DBLAYOUT = String(process.env.FM_DBLAYOUT || '');
const FM_USER = String(process.env.FM_USER || '');
const FM_PASSWORD = String(process.env.FM_PASSWORD || '');

export const getLoginToken = async (): Promise<string> => {
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
    log(
      {
        title: 'FM Login',
        user: FM_USER,
        password: FM_PASSWORD,
        url: `${FM_HOST}/fmi/data/v1/databases/${FM_DBNAME}/sessions`,
        response: resJSON,
      },
      logLevels.DEBUG
    );
    return resJSON.response.token;
  } catch (e) {
    log(e);
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
    log(
      {
        title: 'FM resolveId',
        token,
        regNumber,
        url: `${FM_HOST}/fmi/data/v1/databases/${FM_DBNAME}/layouts/${FM_DBLAYOUT}/_find`,
        response: resJSON,
      },
      logLevels.DEBUG
    );
    const records = resJSON.response.data;
    if (!records) {
      log('resolveId response: ' + resJSON, logLevels.DEBUG);
      return '';
    }
    const record = records[records.length - 1];
    return record.recordId;
  } catch (e) {
    log(e);
    throw new Error('Registration number could not be resolved');
  }
};

const updateRecord = async (
  record: string,
  fieldData: Object
): Promise<number> => {
  try {
    const token = await getLoginToken();
    const res = await fetch(
      `${FM_HOST}/fmi/data/v1/databases/${FM_DBNAME}/layouts/${FM_DBLAYOUT}/records/${record}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          fieldData,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const resJSON = await res.json();
    log(
      {
        title: 'FM resolveId',
        token,
        fieldData,
        url: `${FM_HOST}/fmi/data/v1/databases/${FM_DBNAME}/layouts/${FM_DBLAYOUT}/records/${record}`,
        response: resJSON,
      },
      logLevels.DEBUG
    );
    log(
      `FILEMAKER UPDATE USER "${record}": ${JSON.stringify(resJSON)}`,
      logLevels.DEBUG
    );
    return resJSON.response.modId || 0;
  } catch (e) {
    log(e);
    return 0;
  }
};

export const setLang = async (
  record: string,
  lang: string
): Promise<number> => {
  try {
    return await updateRecord(record, {
      lang,
    });
  } catch (e) {
    log(e);
    return 0;
  }
};

export const setPhoneNumberAdded = async (
  record: string,
  added: boolean
): Promise<number> => {
  try {
    return await updateRecord(record, {
      IsPhoneNumberAdded: added ? 'true' : 'false',
    });
  } catch (e) {
    log(e);
    return 0;
  }
};
