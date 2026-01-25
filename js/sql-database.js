/**
 * VideoBate SQL Database Manager
 * ==============================
 * Browser-based SQLite database using sql.js
 * 
 * SHARED DATABASE ARCHITECTURE:
 * - All AIUNITES sites use the same database: AIUNITES/AIUNITES-database-sync/data/app.db
 * - Users are filtered by the 'site' column to separate per-site data
 * - Passwords are securely hashed using SHA-256
 */

const SQLDatabase = {
  db: null,
  isLoaded: false,
  SQL: null,
  
  // Site identifier (used to filter users in shared database)
  SITE_ID: 'videobate',
  
  // Storage keys
  STORAGE_KEY: 'videobate_sqldb',
  
  // SHARED AIUNITES GitHub config (same database for all sites)
  DEFAULT_GITHUB_CONFIG: {
    owner: 'AIUNITES',
    repo: 'AIUNITES-database-sync',
    path: 'data/app.db',  // SHARED database for all AIUNITES sites
    token: ''
  },
  
  // ==================== PASSWORD HASHING ====================
  
  /**
   * Hash a password using SHA-256
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hex-encoded hash
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },
  
  /**
   * Verify a password against a hash
   * @param {string} password - Plain text password to verify
   * @param {string} hash - Stored hash to compare against
   * @returns {Promise<boolean>} - True if password matches
   */
  async verifyPassword(password, hash) {
    // Support both hashed and plain text passwords during transition
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hash || password === hash;
  },
  
  // ==================== INITIALIZATION ====================
  
  /**
   * Initialize sql.js and load database
   */
  async init() {
    try {
      // Load sql.js WebAssembly
      this.SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
      });
      
      console.log('[VideoBate-SQL] sql.js loaded successfully');
      console.log('[VideoBate-SQL] Site ID:', this.SITE_ID);
      
      // Try to load saved database from localStorage
      await this.loadFromStorage();
      
      // If no local database AND not on localhost, auto-load from GitHub
      if (!this.isLoaded && !this.isLocalhost()) {
        console.log('[VideoBate-SQL] No local database, attempting GitHub auto-load...');
        const loaded = await this.autoLoadFromGitHub();
        if (loaded) {
          console.log('[VideoBate-SQL] Auto-loaded from GitHub (shared database)');
        } else {
          console.log('[VideoBate-SQL] GitHub load failed, creating new database');
          this.createNewDatabase();
        }
      } else if (!this.isLoaded) {
        console.log('[VideoBate-SQL] Localhost mode, creating new database');
        this.createNewDatabase();
      }
      
      // Ensure users table exists with site column
      await this.ensureUsersTable();
      
      return true;
      
    } catch (error) {
      console.error('[VideoBate-SQL] Init failed:', error);
      return false;
    }
  },
  
  /**
   * Check if running on localhost
   */
  isLocalhost() {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    return host === 'localhost' || 
           host === '127.0.0.1' || 
           host.startsWith('192.168.') ||
           protocol === 'file:';
  },
  
  /**
   * Auto-load database from GitHub (shared database)
   */
  async autoLoadFromGitHub() {
    try {
      const config = this.DEFAULT_GITHUB_CONFIG;
      const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
      
      console.log('[VideoBate-SQL] Loading shared database from:', apiUrl);
      
      const resp = await fetch(apiUrl);
      
      if (!resp.ok) {
        console.warn('[VideoBate-SQL] GitHub API:', resp.status);
        return false;
      }
      
      const data = await resp.json();
      
      // Decode base64 content
      const binary = atob(data.content.replace(/\n/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      // Load into sql.js
      this.db = new this.SQL.Database(bytes);
      this.isLoaded = true;
      
      console.log('[VideoBate-SQL] Loaded shared database:', bytes.length, 'bytes');
      return true;
      
    } catch (error) {
      console.error('[VideoBate-SQL] GitHub load error:', error);
      return false;
    }
  },
  
  /**
   * Load from localStorage
   */
  async loadFromStorage() {
    try {
      const base64 = localStorage.getItem(this.STORAGE_KEY);
      if (!base64) return false;
      
      const binary = atob(base64);
      const data = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        data[i] = binary.charCodeAt(i);
      }
      
      this.db = new this.SQL.Database(data);
      this.isLoaded = true;
      
      console.log('[VideoBate-SQL] Loaded from localStorage');
      return true;
      
    } catch (error) {
      console.error('[VideoBate-SQL] localStorage load error:', error);
      return false;
    }
  },
  
  /**
   * Create new empty database
   */
  createNewDatabase() {
    this.db = new this.SQL.Database();
    this.isLoaded = true;
    console.log('[VideoBate-SQL] New database created');
  },
  
  /**
   * Auto-save to localStorage
   */
  autoSave() {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      const base64 = btoa(String.fromCharCode.apply(null, data));
      localStorage.setItem(this.STORAGE_KEY, base64);
      console.log('[VideoBate-SQL] Saved to localStorage');
    } catch (error) {
      console.error('[VideoBate-SQL] Save error:', error);
    }
  },
  
  /**
   * Ensure users table exists with proper schema (matching DemoTemplate)
   */
  async ensureUsersTable() {
    if (!this.db) return;
    
    try {
      // Check if table exists
      const tableExists = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      
      if (!tableExists.length) {
        // Create table matching DemoTemplate schema
        console.log('[VideoBate-SQL] Creating users table...');
        this.db.run(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT,
            email TEXT,
            role TEXT DEFAULT 'user',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT,
            site TEXT DEFAULT 'videobate'
          )
        `);
      } else {
        // Check if site column exists, add if missing
        const columns = this.db.exec("PRAGMA table_info(users)");
        const hasSiteColumn = columns[0]?.values.some(col => col[1] === 'site');
        
        if (!hasSiteColumn) {
          console.log('[VideoBate-SQL] Adding site column to existing table...');
          this.db.run("ALTER TABLE users ADD COLUMN site TEXT DEFAULT 'DemoTemplate'");
        }
      }
      
      // Check if we have any users for THIS site, if not create defaults
      const result = this.db.exec(`SELECT COUNT(*) FROM users WHERE site = '${this.SITE_ID}'`);
      const count = result[0]?.values[0]?.[0] || 0;
      
      if (count === 0) {
        console.log('[VideoBate-SQL] Creating default users for site:', this.SITE_ID);
        await this.createDefaultUsers();
      } else {
        console.log('[VideoBate-SQL] Found', count, 'users for site:', this.SITE_ID);
      }
      
      this.autoSave();
      
    } catch (error) {
      console.error('[VideoBate-SQL] ensureUsersTable error:', error);
    }
  },
  
  /**
   * Create default demo users for VideoBate (with hashed passwords)
   */
  async createDefaultUsers() {
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin123',
        display_name: 'Administrator',
        email: 'admin@videobate.com',
        role: 'admin'
      },
      {
        username: 'demo',
        password: 'demo123',
        display_name: 'Demo User',
        email: 'demo@videobate.com',
        role: 'user'
      },
      {
        username: 'sarahlogic',
        password: 'password123',
        display_name: 'Sarah Logic',
        email: 'sarah@example.com',
        role: 'user'
      }
    ];
    
    for (const user of defaultUsers) {
      try {
        const hashedPassword = await this.hashPassword(user.password);
        this.db.run(`
          INSERT INTO users (username, password_hash, display_name, email, role, site)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [user.username, hashedPassword, user.display_name, user.email, user.role, this.SITE_ID]);
      } catch (e) {
        console.warn('[VideoBate-SQL] User exists:', user.username);
      }
    }
    
    console.log('[VideoBate-SQL] Default users created for site:', this.SITE_ID);
  },
  
  // ==================== USER AUTHENTICATION ====================
  
  /**
   * Authenticate user by username/email and password (filtered by site)
   * @returns {Object|null} User object or null if invalid
   */
  async authenticateUser(usernameOrEmail, password) {
    if (!this.db) {
      console.warn('[VideoBate-SQL] Database not loaded');
      return null;
    }
    
    try {
      // Find user by username or email for this site
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE site = ?
        AND (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
      `);
      
      stmt.bind([this.SITE_ID, usernameOrEmail, usernameOrEmail]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        
        // Verify password (supports both hashed and plain text during transition)
        const isValid = await this.verifyPassword(password, row.password_hash);
        
        if (!isValid) {
          console.log('[VideoBate-SQL] Auth failed: invalid password for', usernameOrEmail);
          return null;
        }
        
        // Update last login
        this.db.run(`UPDATE users SET last_login = datetime('now') WHERE id = ?`, [row.id]);
        this.autoSave();
        
        console.log('[VideoBate-SQL] Auth successful for:', row.username, '(site:', row.site, ')');
        
        // Return user object in the format VideoBate expects
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          displayName: row.display_name,
          // Split display_name for backwards compatibility
          firstName: row.display_name?.split(' ')[0] || '',
          lastName: row.display_name?.split(' ').slice(1).join(' ') || '',
          role: row.role,
          createdAt: row.created_at,
          lastLogin: row.last_login,
          site: row.site,
          // Include empty stats for backwards compatibility
          stats: {
            totalScore: 0,
            gamesPlayed: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            bestStreak: 0,
            badges: []
          }
        };
      }
      
      stmt.free();
      console.log('[VideoBate-SQL] Auth failed: user not found', usernameOrEmail, '(site:', this.SITE_ID, ')');
      return null;
      
    } catch (error) {
      console.error('[VideoBate-SQL] Auth error:', error);
      return null;
    }
  },
  
  /**
   * Get user by username (filtered by site)
   */
  getUserByUsername(username) {
    if (!this.db) return null;
    
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE site = ? AND LOWER(username) = LOWER(?)
      `);
      stmt.bind([this.SITE_ID, username]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          displayName: row.display_name,
          firstName: row.display_name?.split(' ')[0] || '',
          lastName: row.display_name?.split(' ').slice(1).join(' ') || '',
          role: row.role,
          createdAt: row.created_at,
          lastLogin: row.last_login,
          site: row.site,
          stats: {
            totalScore: 0,
            gamesPlayed: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            bestStreak: 0,
            badges: []
          }
        };
      }
      
      stmt.free();
      return null;
      
    } catch (error) {
      console.error('[VideoBate-SQL] getUserByUsername error:', error);
      return null;
    }
  },
  
  /**
   * Check if username exists (within this site)
   */
  usernameExists(username) {
    if (!this.db) return false;
    
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) FROM users 
        WHERE site = ? AND LOWER(username) = LOWER(?)
      `);
      stmt.bind([this.SITE_ID, username]);
      stmt.step();
      const count = stmt.get()[0];
      stmt.free();
      return count > 0;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Check if email exists (within this site)
   */
  emailExists(email) {
    if (!this.db) return false;
    
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) FROM users 
        WHERE site = ? AND LOWER(email) = LOWER(?)
      `);
      stmt.bind([this.SITE_ID, email]);
      stmt.step();
      const count = stmt.get()[0];
      stmt.free();
      return count > 0;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Register new user (with site identifier and hashed password)
   */
  async registerUser(userData) {
    if (!this.db) {
      throw new Error('Database not available');
    }
    
    // Check for existing username within this site
    if (this.usernameExists(userData.username)) {
      throw new Error('Username already taken');
    }
    
    // Check for existing email within this site
    if (userData.email && this.emailExists(userData.email)) {
      throw new Error('Email already registered');
    }
    
    try {
      // Hash the password
      const hashedPassword = await this.hashPassword(userData.password);
      
      // Create display_name from firstName + lastName or use provided displayName
      const displayName = userData.displayName || 
        `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
        userData.username;
      
      this.db.run(`
        INSERT INTO users (username, password_hash, display_name, email, role, site)
        VALUES (?, ?, ?, ?, 'user', ?)
      `, [
        userData.username.toLowerCase(),
        hashedPassword,
        displayName,
        userData.email?.toLowerCase() || '',
        this.SITE_ID
      ]);
      
      this.autoSave();
      
      console.log('[VideoBate-SQL] User registered:', userData.username, 'for site:', this.SITE_ID);
      
      // Return the created user
      return this.getUserByUsername(userData.username);
      
    } catch (error) {
      console.error('[VideoBate-SQL] Register error:', error);
      throw new Error('Registration failed: ' + error.message);
    }
  },
  
  /**
   * Get all users for this site (for leaderboard)
   */
  getAllUsers() {
    if (!this.db) return [];
    
    try {
      const result = this.db.exec(`
        SELECT * FROM users 
        WHERE site = '${this.SITE_ID}'
        ORDER BY username ASC
      `);
      
      if (!result.length) return [];
      
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const user = {};
        columns.forEach((col, i) => {
          user[col] = row[i];
        });
        
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          firstName: user.display_name?.split(' ')[0] || '',
          lastName: user.display_name?.split(' ').slice(1).join(' ') || '',
          role: user.role,
          createdAt: user.created_at,
          lastLogin: user.last_login,
          site: user.site,
          stats: {
            totalScore: 0,
            gamesPlayed: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            bestStreak: 0,
            badges: []
          }
        };
      });
      
    } catch (error) {
      console.error('[VideoBate-SQL] getAllUsers error:', error);
      return [];
    }
  },
  
  /**
   * Get database status
   */
  getStatus() {
    if (!this.db) {
      return {
        loaded: false,
        hasDatabase: false,
        userCount: 0,
        site: this.SITE_ID
      };
    }
    
    try {
      const totalResult = this.db.exec("SELECT COUNT(*) FROM users");
      const totalCount = totalResult[0]?.values[0]?.[0] || 0;
      
      const siteResult = this.db.exec(`SELECT COUNT(*) FROM users WHERE site = '${this.SITE_ID}'`);
      const siteCount = siteResult[0]?.values[0]?.[0] || 0;
      
      return {
        loaded: this.isLoaded,
        hasDatabase: true,
        userCount: siteCount,
        totalUsers: totalCount,
        site: this.SITE_ID
      };
    } catch (error) {
      return {
        loaded: this.isLoaded,
        hasDatabase: !!this.db,
        userCount: 0,
        site: this.SITE_ID,
        error: error.message
      };
    }
  }
};

// Export for global access
window.SQLDatabase = SQLDatabase;
