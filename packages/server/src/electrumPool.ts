import { ElectrumClient } from "./electrumClient.js";

const ELECTRUM_SERVERS = {
  "electrum.blockstream.info": {
    port: 50002,
    useSSL: true,
  },
  "electrum.bitaroo.net": {
    port: 50002,
    useSSL: true,
  },
  "electrum.acinq.co": {
    port: 50002,
    useSSL: true,
  },
  "bitcoin.lukechilds.co": {
    port: 50002,
    useSSL: true,
  },
  "electrum.emzy.de": {
    port: 50002,
    useSSL: true,
  },
}

const MAX_ACTIVE_CONNECTIONS = 3;

interface PooledConnection {
  client: ElectrumClient;
  isAlive: boolean;
  serverKey: string;
  config: { port: number, useSSL: boolean };
}

export class ElectrumPool {


  private connections: Map<string, PooledConnection> = new Map<string, PooledConnection>();
  constructor(private servers: typeof ELECTRUM_SERVERS = ELECTRUM_SERVERS) {
    this.initializeConnections();
  }

  private initializeConnections() {
    const serverEntries = Object.entries(this.servers);
    const shuffled = serverEntries.sort(() => Math.random() - 0.5);
    const toConnect = shuffled.slice(0, MAX_ACTIVE_CONNECTIONS);

    for (const [serverKey, serverConfig] of toConnect) {
      this.createConnection(serverKey, serverConfig);
    }
  }

  private async createConnection(serverKey: string, config: { port: number, useSSL: boolean }) {

    try {
      const client = new ElectrumClient(serverKey, config.port, config.useSSL, () => this.onDisconnect(serverKey));
      await client.connect();

      this.connections.set(serverKey, {
        client,
        isAlive: true,
        config,
        serverKey,
      });

    } catch (err) {
      console.error(`Failed to create connection to ${serverKey}: ${err}`);
    }
  }

  private onDisconnect(serverKey: string) {
    const conn = this.connections.get(serverKey)!;
    if (conn) {
      conn.isAlive = false;
    }
  }

  private async recreateDeadConnections() {
    const deadConnections = Array.from(this.connections.entries()).filter(([, conn]) => !conn.isAlive);
    const activeServerKeys = new Set(this.connections.keys());
    const availableServers = Object.entries(this.servers).filter(([key]) => !activeServerKeys.has(key));

    for (const [deadKey] of deadConnections) {
      this.connections.delete(deadKey);

      if (availableServers.length > 0) {
        const [newKey, newConfig] = availableServers.shift()!;
        await this.createConnection(newKey, newConfig);
      } else {
        // No new servers available, retry the dead one
        const config = this.servers[deadKey as keyof typeof this.servers];
        if (config) {
          await this.createConnection(deadKey, config);
        }
      }
    }
  }


  public async getConnection(): Promise<ElectrumClient> {
    let aliveConnections = Array.from(this.connections.values()).filter((conn) => conn.isAlive);

    if (aliveConnections.length === 0) {
      await this.recreateDeadConnections();
      // Retry to get alive connections
      aliveConnections = Array.from(this.connections.values()).filter((conn) => conn.isAlive);
      if (aliveConnections.length === 0) {
        throw new Error('No alive connections found');
      }
    }

    const randomConnection = aliveConnections[Math.floor(Math.random() * aliveConnections.length)];
    return randomConnection!.client;
  }

}