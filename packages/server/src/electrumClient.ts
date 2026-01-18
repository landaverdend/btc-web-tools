import net from 'net';
import tls from 'tls';


const DEFAULT_PORTS = { t: '50001', s: '50002' }
const DEFAULT_SERVERS = []

type Callback = {
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

export class ElectrumClient {

  private conn: net.Socket | tls.TLSSocket | null = null;
  private requestId: number = 0;
  private callbackMap: Map<number, Callback> = new Map<number, Callback>();

  constructor(private host: string, private port: number, private useSSL: boolean = false) {
    this.host = host;
    this.port = port;
    this.useSSL = useSSL;

    this.conn = null;

    this.requestId = 0;
    this.callbackMap = new Map<number, Callback>();
  }


  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to ${this.host}:${this.port} (SSL: ${this.useSSL})`);

      if (this.useSSL) {
        this.conn = tls.connect({
          host: this.host,
          port: this.port,
          rejectUnauthorized: false, // Some Electrum servers use self-signed certs
        }, () => {
          console.log(`Connected to ${this.host}:${this.port} via SSL`);
          resolve(this.conn);
        });
      } else {
        this.conn = net.createConnection({
          host: this.host,
          port: this.port,
        }, () => {
          console.log(`Connected to ${this.host}:${this.port}`);
          resolve(this.conn);
        });
      }

      this.conn.on('data', (data) => this._onData(data));
      this.conn.on('error', reject);

      this.conn.on('close', () => {
        console.log(`Disconnected from ${this.host}:${this.port}`);
        reject(new Error('Disconnected from electrum server'));
      });
    })
  }


  private _onData(data: Buffer) {
    console.log(`Received data: ${data.toString()}`);
  }

  private async request(method: string, params: any[]) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;

      this.callbackMap.set(id, { resolve, reject });

      const payload = JSON.stringify({
        jsonrpc: "2.0",
        id: id,
        method: method,
        params: params
      }) + '\n';

      if (!this.conn) {
        reject(new Error('Not connected to electrum server'))
        return;
      }

      this.conn.write(payload);
    })
  }
}