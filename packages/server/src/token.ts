import dotenv from 'dotenv';

dotenv.config();

const BLOCKSTREAM_CLIENT_ID = process.env['BLOCKSTREAM_CLIENT_ID'];
const BLOCKSTREAM_CLIENT_SECRET = process.env['BLOCKSTREAM_CLIENT_SECRET'];

export class TokenFetcher {
  private static token: string = '';
  private static expiresAt: number = 0;

  private static readonly TOKEN_URL: string =
    'https://login.blockstream.com/realms/blockstream-public/protocol/openid-connect/token';

  static async getToken() {
    if (!TokenFetcher.isTokenExpired()) {
      return TokenFetcher.token;
    }
    const params = new URLSearchParams();

    params.append('client_id', BLOCKSTREAM_CLIENT_ID || '');
    params.append('client_secret', BLOCKSTREAM_CLIENT_SECRET || '');
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'openid');

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    };

    try {
      const response = await fetch(TokenFetcher.TOKEN_URL, options);
      const data = await response.json();

      TokenFetcher.token = data['access_token'];
      TokenFetcher.expiresAt = Date.now() + data['expires_in'] * 1000;
    } catch (error) {
      console.error('Error grabbing blockstream token: ', error);
    }

    return TokenFetcher.token;
  }

  static isTokenExpired() {
    return Date.now() >= TokenFetcher.expiresAt;
  }
}
