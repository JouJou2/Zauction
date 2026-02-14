import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseService {
    constructor() {
        // Create data directory if it doesn't exist
        const dataDir = join(__dirname, '../../data');
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
        }

    this.dbPath = join(dataDir, 'whatsapp.json');
    this.initializeStore();
    }

  initializeStore() {
    if (!existsSync(this.dbPath)) {
      const initialData = {
        users: [],
        otp_verifications: [],
        notification_logs: []
      };
      writeFileSync(this.dbPath, JSON.stringify(initialData, null, 2), 'utf8');
    }

    console.log('✅ JSON database initialized');
  }

  readStore() {
    try {
      const raw = readFileSync(this.dbPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return {
        users: [],
        otp_verifications: [],
        notification_logs: []
      };
    }
  }

  writeStore(data) {
    writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf8');
  }

  nextId(items) {
    if (!items.length) return 1;
    return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
    }

    // OTP Methods
    saveOTP(phoneNumber, otpCode, expiresInMinutes = 5) {
    const store = this.readStore();
    const entry = {
      id: this.nextId(store.otp_verifications),
      phone_number: phoneNumber,
      otp_code: String(otpCode),
      expires_at: Date.now() + expiresInMinutes * 60000,
      verified: false,
      created_at: new Date().toISOString()
    };

    store.otp_verifications.push(entry);
    this.writeStore(store);

    return entry;
    }

    verifyOTP(phoneNumber, otpCode) {
    const store = this.readStore();
    const now = Date.now();

    const otpEntry = [...store.otp_verifications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .find((entry) => (
        entry.phone_number === phoneNumber
        && String(entry.otp_code) === String(otpCode)
        && !entry.verified
        && Number(entry.expires_at) > now
      ));

    if (!otpEntry) {
      return false;
    }

    otpEntry.verified = true;
    this.writeStore(store);
    return true;
    }

    // User Methods
    createUser(phoneNumber) {
    const store = this.readStore();
    const existing = store.users.find((user) => user.phone_number === phoneNumber);

    if (existing) {
      existing.phone_verified = true;
      this.writeStore(store);
      return existing;
    }

    const created = {
      id: this.nextId(store.users),
      phone_number: phoneNumber,
      phone_verified: true,
      whatsapp_opt_in: true,
      created_at: new Date().toISOString()
    };

    store.users.push(created);
    this.writeStore(store);
    return created;
    }

    getUserByPhone(phoneNumber) {
    const store = this.readStore();
    return store.users.find((user) => user.phone_number === phoneNumber) || null;
    }

    getAllOptedInUsers() {
    const store = this.readStore();
    return store.users
      .filter((user) => user.whatsapp_opt_in && user.phone_verified)
      .map((user) => ({ phone_number: user.phone_number }));
    }

    // Notification Logs
    logNotification(phoneNumber, auctionId, status = 'sent') {
    const store = this.readStore();
    const log = {
      id: this.nextId(store.notification_logs),
      phone_number: phoneNumber,
      auction_id: auctionId,
      notification_type: 'whatsapp',
      status,
      sent_at: new Date().toISOString()
    };

    store.notification_logs.push(log);
    this.writeStore(store);
    return log;
    }

    getNotificationStats(auctionId) {
    const store = this.readStore();
    const logs = store.notification_logs.filter((log) => String(log.auction_id) === String(auctionId));
    const grouped = logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([status, count]) => ({ status, count }));
    }
}

export default new DatabaseService();
