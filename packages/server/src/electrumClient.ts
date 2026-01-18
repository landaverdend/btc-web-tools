import net from 'net';
import tls from 'tls';


type Callbacks = {
  resolve: (result: any) => void;
  reject: (error: any) => void;
}

export class ElectrumClient {

  private conn: net.Socket | tls.TLSSocket | null = null;
  private requestId: number = 0;

  private callbackMap: Map<number, Callbacks> = new Map<number, Callbacks>();
  private _buffer: string = '';


  constructor(private host: string, private port: number, private useSSL: boolean = false, private onDisconnect: () => void) {
    this.host = host;
    this.port = port;
    this.useSSL = useSSL;

    this.conn = null;

    this.requestId = 0;
    this.callbackMap = new Map<number, Callbacks>();
    this.onDisconnect = onDisconnect;
  }

  // Create the connection and make the first on the wire request for the electrum protocol
  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`Connecting to ${this.host}:${this.port} (SSL: ${this.useSSL})`);

      if (this.useSSL) {
        this.conn = tls.connect({
          host: this.host,
          port: this.port,
          rejectUnauthorized: false, // Some Electrum servers use self-signed certs
        }, async () => {
          const [serverVersion, protocolVersion] = await this.getServerVersion();
          console.log(`Connected to ${this.host}:${this.port} via SSL: ${serverVersion} (protocol: ${protocolVersion})`);
          resolve(this.conn);
        });
      } else {
        this.conn = net.createConnection({
          host: this.host,
          port: this.port,
        }, async () => {
          const [serverVersion, protocolVersion] = await this.getServerVersion();
          console.log(`Connected to ${this.host}:${this.port}: ${serverVersion} (protocol: ${protocolVersion})`);
          resolve(this.conn);
        });
      }

      this.conn.on('data', (data) => this._onData(data));
      this.conn.on('error', (err) => {
        this.onDisconnect();
        reject(err);
      });

      this.conn.on('close', () => {
        console.log(`Disconnected from ${this.host}:${this.port}`);
        this.onDisconnect();
        reject(new Error('Disconnected from electrum server'));
      });
    })
  }


  private _onData(data: Buffer) {
    this._buffer += data.toString();

    // Electrum uses line-delimited JSON-RPC, split by newlines
    const lines = this._buffer.split('\n');

    this._buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line) continue;

      try {
        const response = JSON.parse(line);

        if (this.callbackMap.has(response.id)) {
          const { resolve, reject } = this.callbackMap.get(response.id)!;

          if (response.error) reject(response.error);
          else resolve(response.result);

          this.callbackMap.delete(response.id);
        }
        else {
          console.error('No callback found for response: ', response);
        }

      } catch (error) {
        console.error('Error parsing line: ', line);
      }
    }

  }

  private async request(method: string, params: any[] = []) {
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

  // Should return an array of two strings:
  // [server_version, protocol_version]
  public async getServerVersion(): Promise<string[]> {
    const result = await this.request('server.version', ['bitcointools.landaverde.io', '1.4.1']);

    if (Array.isArray(result) && result.length === 2) {
      return result as [string, string];
    }

    throw new Error('Invalid server.version response');
  }

  public async getTx(txid: string, verbose: boolean = false): Promise<any> {
    const result = await this.request("blockchain.transaction.get", [txid, verbose])

    if (result) {
      return result;
    }

    throw new Error('Transaction not found...')
  }
}