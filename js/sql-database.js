/**
 * VideoBate SQL Database Manager
 * ==============================
 * Browser-based SQLite database using sql.js
 * 
 * SHARED DATABASE ARCHITECTURE:
 * - All AIUNITES sites use the same database: AIUNITES/AIUNITES-database-sync/data/app.db
 * - Users are filtered by the 'app' column to separate per-site data
 * - This allows a single database to serve multiple applications
 */

const SQLDatabase = {
  db: null,
  isLoaded: false,
  SQL: null,
  
  // App identifier for this site (used to filter users)
  APP_ID: 'videobate',
  
  // Storage keys
  STORAGE_KEY: 'videobate_sqldb',
  
  // SHARED AIUNITES GitHub config (same database for all sites)
  DEFAULT_GITHUB_CONFIG: {
    owner: 'AIUNITES',
    repo: 'AIUNITES-database-sync',
    path: 'data/app.db',  // SHARED database for all AIUNITES sites
    token: ''
  },
  
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
      console.log('[VideoBate-SQL] App ID:', this.APP_ID);
      
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
      
      // Ensure users table exists with app column
      this.ensureUsersTable();
      
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
   * Ensure users table exists with proper schema INCLUDING app column
   */
  ensureUsersTable() {
    if (!this.db) return;
    
    try {
      // Check if table exists
      const tableExists = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      
      if (!tableExists.length) {
        // Create table with app column for multi-site support
        console.log('[VideoBate-SQL] Creating users table with app column...');
        this.db.run(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app TEXT NOT NULL DEFAULT 'videobate',
            username TEXT NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            firstName TEXT,
            lastName TEXT,
            role TEXT DEFAULT 'user',
            totalScore INTEGER DEFAULT 0,
            gamesPlayed INTEGER DEFAULT 0,
            correctAnswers INTEGER DEFAULT 0,
            wrongAnswers INTEGER DEFAULT 0,
            bestStreak INTEGER DEFAULT 0,
            badges TEXT DEFAULT '[]',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            lastLogin TEXT,
            UNIQUE(app, username),
            UNIQUE(app, email)
          )
        `);
      } else {
        // Check if app column exists, add if missing
        const columns = this.db.exec("PRAGMA table_info(users)");
        const hasAppColumn = columns[0]?.values.some(col => col[1] === 'app');
        
        if (!hasAppColumn) {
          console.log('[VideoBate-SQL] Adding app column to existing table...');
          this.db.run("ALTER TABLE users ADD COLUMN app TEXT NOT NULL DEFAULT 'demotemplate'");
        }
      }
      
      // Check if we have any users for THIS app, if not create defaults
      const result = this.db.exec(`SELECT COUNT(*) FROM users WHERE app = '${this.APP_ID}'`);
      const count = result[0]?.values[0]?.[0] || 0;
      
      if (count === 0) {
        console.log('[VideoBate-SQL] Creating default users for app:', this.APP_ID);
        this.createDefaultUsers();
      } else {
        console.log('[VideoBate-SQL] Found', count, 'users for app:', this.APP_ID);
      }
      
      this.autoSave();
      
    } catch (error) {
      console.error('[VideoBate-SQL] ensureUsersTable error:', error);
    }
  },
  
  /**
   * Create default demo users for VideoBate
   */
  createDefaultUsers() {
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@videobate.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        totalScore: 5000,
        gamesPlayed: 50,
        correctAnswers: 400,
        wrongAnswers: 50,
        bestStreak: 15,
        badges: JSON.stringify(['🏆 Perfect Score', '🔥 Hot Streak', '🎯 Sharp Eye'])
      },
      {
        username: 'demo',
        email: 'demo@videobate.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        totalScore: 1500,
        gamesPlayed: 20,
        correctAnswers: 150,
        wrongAnswers: 50,
        bestStreak: 8,
        badges: JSON.stringify(['🔥 Hot Streak'])
      },
      {
        username: 'sarahlogic',
        email: 'sarah@example.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Logic',
        role: 'user',
        totalScore: 3200,
        gamesPlayed: 35,
        correctAnswers: 280,
        wrongAnswers: 70,
        bestStreak: 12,
        badges: JSON.stringify(['🔥 Hot Streak', '🎮 Regular Player'])
      }
    ];
    
    const stmt = this.db.prepare(`
      INSERT INTO users (app, username, email, password, firstName, lastName, role, 
        totalScore, gamesPlayed, correctAnswers, wrongAnswers, bestStreak, badges)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    defaultUsers.forEach(user => {
      try {
        stmt.run([
          this.APP_ID,  // Add app identifier
          user.username, user.email, user.password, user.firstName, user.lastName,
          user.role, user.totalScore, user.gamesPlayed, user.correctAnswers,
          user.wrongAnswers, user.bestStreak, user.badges
        ]);
      } catch (e) {
        console.warn('[VideoBate-SQL] User exists:', user.username);
      }
    });
    
    stmt.free();
    console.log('[VideoBate-SQL] Default users created for app:', this.APP_ID);
  },
  
  // ==================== USER AUTHENTICATION ====================
  
  /**
   * Authenticate user by username/email and password (filtered by app)
   * @returns {Object|null} User object or null if invalid
   */
  authenticateUser(usernameOrEmail, password) {
    if (!this.db) {
      console.warn('[VideoBate-SQL] Database not loaded');
      return null;
    }
    
    try {
      // Filter by app column to only authenticate users for this site
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE app = ?
        AND (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
        AND password = ?
      `);
      
      stmt.bind([this.APP_ID, usernameOrEmail, usernameOrEmail, password]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        
        // Update last login
        this.db.run(`UPDATE users SET lastLogin = datetime('now') WHERE id = ?`, [row.id]);
        this.autoSave();
        
        // Parse badges JSON
        try {
          row.badges = JSON.parse(row.badges || '[]');
        } catch (e) {
          row.badges = [];
        }
        
        console.log('[VideoBate-SQL] Auth successful for:', row.username, '(app:', row.app, ')');
        
        // Return user object in the format VideoBate expects
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          role: row.role,
          createdAt: row.createdAt,
          stats: {
            totalScore: row.totalScore || 0,
            gamesPlayed: row.gamesPlayed || 0,
            correctAnswers: row.correctAnswers || 0,
            wrongAnswers: row.wrongAnswers || 0,
            bestStreak: row.bestStreak || 0,
            badges: row.badges
          }
        };
      }
      
      stmt.free();
      console.log('[VideoBate-SQL] Auth failed for:', usernameOrEmail, '(app:', this.APP_ID, ')');
      return null;
      
    } catch (error) {
      console.error('[VideoBate-SQL] Auth error:', error);
      return null;
    }
  },
  
  /**
   * Get user by username (filtered by app)
   */
  getUserByUsername(username) {
    if (!this.db) return null;
    
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE app = ? AND LOWER(username) = LOWER(?)
      `);
      stmt.bind([this.APP_ID, username]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        
        try {
          row.badges = JSON.parse(row.badges || '[]');
        } catch (e) {
          row.badges = [];
        }
        
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          role: row.role,
          createdAt: row.createdAt,
          stats: {
            totalScore: row.totalScore || 0,
            gamesPlayed: row.gamesPlayed || 0,
            correctAnswers: row.correctAnswers || 0,
            wrongAnswers: row.wrongAnswers || 0,
            bestStreak: row.bestStreak || 0,
            badges: row.badges
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
   * Check if username exists (within this app)
   */
  usernameExists(username) {
    if (!this.db) return false;
    
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) FROM users 
        WHERE app = ? AND LOWER(username) = LOWER(?)
      `);
      stmt.bind([this.APP_ID, username]);
      stmt.step();
      const count = stmt.get()[0];
      stmt.free();
      return count > 0;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Check if email exists (within this app)
   */
  emailExists(email) {
    if (!this.db) return false;
    
    try {
      const stmt = this.db.prepare(`
        SELECT COUNT(*) FROM users 
        WHERE app = ? AND LOWER(email) = LOWER(?)
      `);
      stmt.bind([this.APP_ID, email]);
      stmt.step();
      const count = stmt.get()[0];
      stmt.free();
      return count > 0;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Register new user (with app identifier)
   */
  registerUser(userData) {
    if (!this.db) {
      throw new Error('Database not available');
    }
    
    // Check for existing username within this app
    if (this.usernameExists(userData.username)) {
      throw new Error('Username already taken');
    }
    
    // Check for existing email within this app
    if (userData.email && this.emailExists(userData.email)) {
      throw new Error('Email already registered');
    }
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (app, username, email, password, firstName, lastName, role, badges)
        VALUES (?, ?, ?, ?, ?, ?, 'user', '[]')
      `);
      
      stmt.run([
        this.APP_ID,  // Add app identifier
        userData.username.toLowerCase(),
        userData.email?.toLowerCase() || '',
        userData.password,
        userData.firstName || '',
        userData.lastName || ''
      ]);
      
      stmt.free();
      this.autoSave();
      
      console.log('[VideoBate-SQL] User registered:', userData.username, 'for app:', this.APP_ID);
      
      // Return the created user
      return this.getUserByUsername(userData.username);
      
    } catch (error) {
      console.error('[VideoBate-SQL] Register error:', error);
      throw new Error('Registration failed: ' + error.message);
    }
  },
  
  /**
   * Update user stats (after quiz)
   */
  updateUserStats(userId, stats) {
    if (!this.db) return false;
    
    try {
      this.db.run(`
        UPDATE users SET
          totalScore = totalScore + ?,
          gamesPlayed = gamesPlayed + 1,
          correctAnswers = correctAnswers + ?,
          wrongAnswers = wrongAnswers + ?,
          bestStreak = MAX(bestStreak, ?)
        WHERE id = ? AND app = ?
      `, [stats.score, stats.correct, stats.wrong, stats.streak, userId, this.APP_ID]);
      
      this.autoSave();
      return true;
      
    } catch (error) {
      console.error('[VideoBate-SQL] Update stats error:', error);
      return false;
    }
  },
  
  /**
   * Get all users for this app (for leaderboard)
   */
  getAllUsers() {
    if (!this.db) return [];
    
    try {
      const result = this.db.exec(`
        SELECT * FROM users 
        WHERE app = '${this.APP_ID}'
        ORDER BY totalScore DESC
      `);
      
      if (!result.length) return [];
      
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const user = {};
        columns.forEach((col, i) => {
          user[col] = row[i];
        });
        
        try {
          user.badges = JSON.parse(user.badges || '[]');
        } catch (e) {
          user.badges = [];
        }
        
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt,
          stats: {
            totalScore: user.totalScore || 0,
            gamesPlayed: user.gamesPlayed || 0,
            correctAnswers: user.correctAnswers || 0,
            wrongAnswers: user.wrongAnswers || 0,
            bestStreak: user.bestStreak || 0,
            badges: user.badges
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
        app: this.APP_ID
      };
    }
    
    try {
      const totalResult = this.db.exec("SELECT COUNT(*) FROM users");
      const totalCount = totalResult[0]?.values[0]?.[0] || 0;
      
      const appResult = this.db.exec(`SELECT COUNT(*) FROM users WHERE app = '${this.APP_ID}'`);
      const appCount = appResult[0]?.values[0]?.[0] || 0;
      
      return {
        loaded: this.isLoaded,
        hasDatabase: true,
        userCount: appCount,
        totalUsers: totalCount,
        app: this.APP_ID
      };
    } catch (error) {
      return {
        loaded: this.isLoaded,
        hasDatabase: !!this.db,
        userCount: 0,
        app: this.APP_ID,
        error: error.message
      };
    }
  }
};

// Export for global access
window.SQLDatabase = SQLDatabase;
