/**
 * VideoBate SQL Database Manager
 * ==============================
 * Browser-based SQLite database using sql.js
 * 
 * SHARED DATABASE ARCHITECTURE:
 * - All AIUNITES sites use the same database: AIUNITES/AIUNITES-database-sync/data/app.db
 * - Users are filtered by the 'site' column to separate per-site data
 * - This allows a single database to serve multiple applications
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
   * Ensure users table exists with proper schema INCLUDING site column
   */
  ensureUsersTable() {
    if (!this.db) return;
    
    try {
      // Check if table exists
      const tableExists = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      
      if (!tableExists.length) {
        // Create table with site column for multi-site support
        console.log('[VideoBate-SQL] Creating users table with site column...');
        this.db.run(`
          CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL DEFAULT 'videobate',
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
            UNIQUE(site, username),
            UNIQUE(site, email)
          )
        `);
      } else {
        // Check if site column exists, add if missing
        const columns = this.db.exec("PRAGMA table_info(users)");
        const hasSiteColumn = columns[0]?.values.some(col => col[1] === 'site');
        
        if (!hasSiteColumn) {
          console.log('[VideoBate-SQL] Adding site column to existing table...');
          this.db.run("ALTER TABLE users ADD COLUMN site TEXT NOT NULL DEFAULT 'demotemplate'");
        }
      }
      
      // Check if we have any users for THIS site, if not create defaults
      const result = this.db.exec(`SELECT COUNT(*) FROM users WHERE site = '${this.SITE_ID}'`);
      const count = result[0]?.values[0]?.[0] || 0;
      
      if (count === 0) {
        console.log('[VideoBate-SQL] Creating default users for site:', this.SITE_ID);
        this.createDefaultUsers();
      } else {
        console.log('[VideoBate-SQL] Found', count, 'users for site:', this.SITE_ID);
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
      INSERT INTO users (site, username, email, password, firstName, lastName, role, 
        totalScore, gamesPlayed, correctAnswers, wrongAnswers, bestStreak, badges)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    defaultUsers.forEach(user => {
      try {
        stmt.run([
          this.SITE_ID,  // Add site identifier
          user.username, user.email, user.password, user.firstName, user.lastName,
          user.role, user.totalScore, user.gamesPlayed, user.correctAnswers,
          user.wrongAnswers, user.bestStreak, user.badges
        ]);
      } catch (e) {
        console.warn('[VideoBate-SQL] User exists:', user.username);
      }
    });
    
    stmt.free();
    console.log('[VideoBate-SQL] Default users created for site:', this.SITE_ID);
  },
  
  // ==================== USER AUTHENTICATION ====================
  
  /**
   * Authenticate user by username/email and password (filtered by site)
   * @returns {Object|null} User object or null if invalid
   */
  authenticateUser(usernameOrEmail, password) {
    if (!this.db) {
      console.warn('[VideoBate-SQL] Database not loaded');
      return null;
    }
    
    try {
      // Filter by site column to only authenticate users for this site
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE site = ?
        AND (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
        AND password = ?
      `);
      
      stmt.bind([this.SITE_ID, usernameOrEmail, usernameOrEmail, password]);
      
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
        
        console.log('[VideoBate-SQL] Auth successful for:', row.username, '(site:', row.site, ')');
        
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
      console.log('[VideoBate-SQL] Auth failed for:', usernameOrEmail, '(site:', this.SITE_ID, ')');
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
   * Register new user (with site identifier)
   */
  registerUser(userData) {
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
      const stmt = this.db.prepare(`
        INSERT INTO users (site, username, email, password, firstName, lastName, role, badges)
        VALUES (?, ?, ?, ?, ?, ?, 'user', '[]')
      `);
      
      stmt.run([
        this.SITE_ID,  // Add site identifier
        userData.username.toLowerCase(),
        userData.email?.toLowerCase() || '',
        userData.password,
        userData.firstName || '',
        userData.lastName || ''
      ]);
      
      stmt.free();
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
        WHERE id = ? AND site = ?
      `, [stats.score, stats.correct, stats.wrong, stats.streak, userId, this.SITE_ID]);
      
      this.autoSave();
      return true;
      
    } catch (error) {
      console.error('[VideoBate-SQL] Update stats error:', error);
      return false;
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
