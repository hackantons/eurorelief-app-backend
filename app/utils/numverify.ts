import fetch from 'node-fetch';

const NUMVERIFY_KEY = String(process.env.NUMVERIFY_KEY || '');

export const isValidPhoneNumber = async (number: string) => {
  try {
    const params = {
      access_key: NUMVERIFY_KEY,
      number,
      format: 1,
    };
    const res = await fetch(
      `http://apilayer.net/api/validate?${Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')}`
    );
    const resJSON = await res.json();
    return resJSON.valid || false;
  } catch (e) {
    return false;
  }
};
