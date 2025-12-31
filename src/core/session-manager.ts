/**
 * Session Manager
 *
 * Manages per-chat/session data storage with workspace context awareness.
 * Sessions are identified by a combination of client info and workspace path.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface SessionData {
  sessionId: string;
  workspacePath?: string;
  workspaceName?: string;
  clientInfo: {
    ip: string;
    userAgent?: string;
  };
  data: Record<string, unknown>;
  metadata: {
    createdAt: number;
    lastAccessed: number;
    accessCount: number;
  };
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * Session Manager class for managing per-chat session data
 */
export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  private sessionDir: string;
  private cacheDir: string;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Create session storage directory
    const baseDir = join(__dirname, "..", "..", ".mcp-sessions");
    this.sessionDir = join(baseDir, "sessions");
    this.cacheDir = join(baseDir, "cache");

    // Ensure directories exist
    if (!existsSync(this.sessionDir)) {
      mkdirSync(this.sessionDir, { recursive: true });
    }
    if (!existsSync(this.cacheDir)) {
      mkdirSync(this.cacheDir, { recursive: true });
    }

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Generate a session ID from client info and workspace
   */
  generateSessionId(
    clientInfo: { ip: string; userAgent?: string },
    workspacePath?: string
  ): string {
    const workspaceHash = workspacePath
      ? Buffer.from(workspacePath).toString("base64").slice(0, 16)
      : "no-workspace";
    const clientHash = Buffer.from(
      `${clientInfo.ip}:${clientInfo.userAgent || "unknown"}`
    )
      .toString("base64")
      .slice(0, 16);
    return `session_${workspaceHash}_${clientHash}_${Date.now()}`;
  }

  /**
   * Get or create a session
   */
  getOrCreateSession(
    sessionId: string,
    clientInfo: { ip: string; userAgent?: string },
    workspacePath?: string
  ): SessionData {
    // Try to load from disk first
    let session = this.loadSessionFromDisk(sessionId);

    if (!session) {
      // Create new session
      const workspaceName = workspacePath
        ? workspacePath.split(/[/\\]/).pop() || "unknown"
        : undefined;

      session = {
        sessionId,
        workspacePath,
        workspaceName,
        clientInfo,
        data: {},
        metadata: {
          createdAt: Date.now(),
          lastAccessed: Date.now(),
          accessCount: 0,
        },
      };

      this.sessions.set(sessionId, session);
      this.saveSessionToDisk(session);
    } else {
      // Update access info
      session.metadata.lastAccessed = Date.now();
      session.metadata.accessCount++;
      session.workspacePath = workspacePath || session.workspacePath;
      session.workspaceName = workspacePath
        ? workspacePath.split(/[/\\]/).pop() || session.workspaceName
        : session.workspaceName;

      this.sessions.set(sessionId, session);
      this.saveSessionToDisk(session);
    }

    return session;
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.metadata.lastAccessed = Date.now();
      session.metadata.accessCount++;
      this.saveSessionToDisk(session);
      return session;
    }

    // Try loading from disk
    return this.loadSessionFromDisk(sessionId);
  }

  /**
   * Set data in a session
   */
  setSessionData(sessionId: string, key: string, value: unknown): void {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.data[key] = value;
    session.metadata.lastAccessed = Date.now();
    this.sessions.set(sessionId, session);
    this.saveSessionToDisk(session);
  }

  /**
   * Get data from a session
   */
  getSessionData<T = unknown>(sessionId: string, key: string): T | null {
    const session = this.getSession(sessionId);
    if (!session) {
      return null;
    }

    return (session.data[key] as T) || null;
  }

  /**
   * Set cache entry
   */
  setCache<T = unknown>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt,
      createdAt: Date.now(),
    };

    this.cache.set(key, entry);
    this.saveCacheToDisk(key, entry);
  }

  /**
   * Get cache entry
   */
  getCache<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      // Try loading from disk
      const diskEntry = this.loadCacheFromDisk<T>(key);
      if (diskEntry) {
        this.cache.set(key, diskEntry);
        return diskEntry.value as T;
      }
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.deleteCacheFromDisk(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Get workspace-specific cache key
   */
  getWorkspaceCacheKey(workspacePath: string | undefined, key: string): string {
    if (!workspacePath) {
      return `global:${key}`;
    }
    const workspaceHash = Buffer.from(workspacePath)
      .toString("base64")
      .slice(0, 16);
    return `workspace:${workspaceHash}:${key}`;
  }

  /**
   * Get all sessions for a workspace
   */
  getWorkspaceSessions(workspacePath: string): SessionData[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.workspacePath === workspacePath
    );
  }

  /**
   * Cleanup expired sessions and cache
   */
  cleanup(): void {
    const now = Date.now();

    // Cleanup expired sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.metadata.lastAccessed > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        this.deleteSessionFromDisk(sessionId);
      }
    }

    // Cleanup expired cache
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        this.deleteCacheFromDisk(key);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, this.CACHE_CLEANUP_INTERVAL);
  }

  /**
   * Save session to disk
   */
  private saveSessionToDisk(session: SessionData): void {
    try {
      const filePath = join(this.sessionDir, `${session.sessionId}.json`);
      writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
      console.error(`[SessionManager] Error saving session to disk:`, error);
    }
  }

  /**
   * Load session from disk
   */
  private loadSessionFromDisk(sessionId: string): SessionData | null {
    try {
      const filePath = join(this.sessionDir, `${sessionId}.json`);
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, "utf-8");
        return JSON.parse(data) as SessionData;
      }
    } catch (error) {
      console.error(`[SessionManager] Error loading session from disk:`, error);
    }
    return null;
  }

  /**
   * Delete session from disk
   */
  private deleteSessionFromDisk(sessionId: string): void {
    try {
      const filePath = join(this.sessionDir, `${sessionId}.json`);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error) {
      // Only log if it's not a "file not found" error (ENOENT)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("ENOENT") && !errorMessage.includes("no such file")) {
        console.error(
          `[SessionManager] Error deleting session from disk:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  }

  /**
   * Save cache to disk
   */
  private saveCacheToDisk(key: string, entry: CacheEntry): void {
    try {
      const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = join(this.cacheDir, `${safeKey}.json`);
      writeFileSync(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.error(`[SessionManager] Error saving cache to disk:`, error);
    }
  }

  /**
   * Load cache from disk
   */
  private loadCacheFromDisk<T>(key: string): CacheEntry<T> | null {
    try {
      const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = join(this.cacheDir, `${safeKey}.json`);
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, "utf-8");
        const entry = JSON.parse(data) as CacheEntry<T>;
        // Check if expired
        if (Date.now() > entry.expiresAt) {
          this.deleteCacheFromDisk(key);
          return null;
        }
        return entry;
      }
    } catch (error) {
      console.error(`[SessionManager] Error loading cache from disk:`, error);
    }
    return null;
  }

  /**
   * Delete cache from disk
   */
  private deleteCacheFromDisk(key: string): void {
    try {
      const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = join(this.cacheDir, `${safeKey}.json`);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error) {
      // Only log if it's not a "file not found" error (ENOENT)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("ENOENT") && !errorMessage.includes("no such file")) {
        console.error(
          `[SessionManager] Error deleting cache from disk:`,
          error instanceof Error ? error.message : error
        );
      }
    }
  }
}

// Singleton instance
export const sessionManager = new SessionManager();
