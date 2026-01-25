/**
 * VideoBate SQL Database Manager
 * ==============================
 * Browser-based SQLite database using sql.js
 * - Auto-loads from GitHub on non-localhost
 * - Provides SQL-based user authentication
 * - Falls back to localStorage if database unavailable
 */

const SQLDatabase = {
  db: null,
  isLoaded: false,
  SQL: null,
  
  // Storage keys
  STORAGE_KEY: 'videobate_sqldb',
  
  // Default AIUNITES GitHub config (for public read-only access)
  DEFAULT_GITHUB_CONFIG: {
    owner: 'AIUNITES',
    repo: 'AIUNITES-database-sync',
    path: 'data/videobate.db',  // VideoBate-specific database
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
      
      // Try to load saved database from localStorage
      await this.loadFromStorage();
      
      // If no local database AND not on localhost, auto-load from GitHub
      if (!this.isLoaded && !this.isLocalhost()) {
        console.log('[VideoBate-SQL] No local database, attempting GitHub auto-load...');
        const loaded = await this.autoLoadFromGitHub();
        if (loaded) {
          console.log('[VideoBate-SQL] Auto-loaded from GitHub');
        } else {
          console.log('[VideoBate-SQL] GitHub load failed, creating new database');
          this.createNewDatabase();
        }
      } else if (!this.isLoaded) {
        console.log('[VideoBate-SQL] Localhost mode, creating new database');
        this.createNewDatabase();
      }
      
      // Ensure users table exists
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
   * Auto-load database from GitHub
   */
  async autoLoadFromGitHub() {
    try {
      const config = this.DEFAULT_GITHUB_CONFIG;
      const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
      
      console.log('[VideoBate-SQL] Loading from:', apiUrl);
      
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
      
      console.log('[VideoBate-SQL] Loaded', bytes.length, 'bytes from GitHub');
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
   * Ensure users table exists with proper schema
   */
  ensureUsersTable() {
    if (!this.db) return;
    
    try {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
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
          lastLogin TEXT
        )
      `);
      
      // Check if we have any users, if not create defaults
      const result = this.db.exec("SELECT COUNT(*) FROM users");
      const count = result[0]?.values[0]?.[0] || 0;
      
      if (count === 0) {
        console.log('[VideoBate-SQL] Creating default users...');
        this.createDefaultUsers();
      }
      
      this.autoSave();
      
    } catch (error) {
      console.error('[VideoBate-SQL] ensureUsersTable error:', error);
    }
  },
  
  /**
   * Create default demo users
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
      INSERT INTO users (username, email, password, firstName, lastName, role, 
        totalScore, gamesPlayed, correctAnswers, wrongAnswers, bestStreak, badges)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    defaultUsers.forEach(user => {
      try {
        stmt.run([
          user.username, user.email, user.password, user.firstName, user.lastName,
          user.role, user.totalScore, user.gamesPlayed, user.correctAnswers,
          user.wrongAnswers, user.bestStreak, user.badges
        ]);
      } catch (e) {
        console.warn('[VideoBate-SQL] User exists:', user.username);
      }
    });
    
    stmt.free();
    console.log('[VideoBate-SQL] Default users created');
  },
  
  // ==================== USER AUTHENTICATION ====================
  
  /**
   * Authenticate user by username/email and password
   * @returns {Object|null} User object or null if invalid
   */
  authenticateUser(usernameOrEmail, password) {
    if (!this.db) {
      console.warn('[VideoBate-SQL] Database not loaded');
      return null;
    }
    
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM users 
        WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
        AND password = ?
      `);
      
      stmt.bind([usernameOrEmail, usernameOrEmail, password]);
      
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
      return null;
      
    } catch (error) {
      console.error('[VideoBate-SQL] Auth error:', error);
      return null;
    }
  },
  
  /**
   * Get user by username
   */
  getUserByUsername(username) {
    if (!this.db) return null;
    
    try {
      const stmt = this.db.prepare(`SELECT * FROM users WHERE LOWER(username) = LOWER(?)`);
      stmt.bind([username]);
      
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
   * Check if username exists
   */
  usernameExists(username) {
    if (!this.db) return false;
    
    try {
      const result = this.db.exec(`SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER('${username.replace(/'/g, "''")}')`);
      return (result[0]?.values[0]?.[0] || 0) > 0;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Check if email exists
   */
  emailExists(email) {
    if (!this.db) return false;
    
    try {
      const result = this.db.exec(`SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER('${email.replace(/'/g, "''")}')`);
      return (result[0]?.values[0]?.[0] || 0) > 0;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Register new user
   */
  registerUser(userData) {
    if (!this.db) {
      throw new Error('Database not available');
    }
    
    // Check for existing username
    if (this.usernameExists(userData.username)) {
      throw new Error('Username already taken');
    }
    
    // Check for existing email
    if (userData.email && this.emailExists(userData.email)) {
      throw new Error('Email already registered');
    }
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (username, email, password, firstName, lastName, role, badges)
        VALUES (?, ?, ?, ?, ?, 'user', '[]')
      `);
      
      stmt.run([
        userData.username.toLowerCase(),
        userData.email?.toLowerCase() || '',
        userData.password,
        userData.firstName || '',
        userData.lastName || ''
      ]);
      
      stmt.free();
      this.autoSave();
      
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
        WHERE id = ?
      `, [stats.score, stats.correct, stats.wrong, stats.streak, userId]);
      
      this.autoSave();
      return true;
      
    } catch (error) {
      console.error('[VideoBate-SQL] Update stats error:', error);
      return false;
    }
  },
  
  /**
   * Get all users (for leaderboard)
   */
  getAllUsers() {
    if (!this.db) return [];
    
    try {
      const result = this.db.exec(`
        SELECT * FROM users ORDER BY totalScore DESC
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
    return {
      loaded: this.isLoaded,
      hasDatabase: !!this.db,
      userCount: this.db ? (this.db.exec("SELECT COUNT(*) FROM users")[0]?.values[0]?.[0] || 0) : 0
    };
  }
};

// Export for global access
window.SQLDatabase = SQLDatabase;
