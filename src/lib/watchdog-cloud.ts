/**
 * Watchdog Cloud SDK for Quvna Web
 * 
 * Bu SDK Quvna Web ilovasini Watchdog Cloud monitoring serveriga ulaydi.
 * Flutter watchdog package bilan bir xil event formatidan foydalanadi.
 * 
 * Xususiyatlari:
 * - HTTP request/response monitoring (Axios interceptor)
 * - Console log capture
 * - Error tracking
 * - Next.js Router navigation tracking
 * - WebSocket event streaming to cloud
 * 
 * Usage:
 * ```ts
 * import { initWatchdogCloud } from "@/lib/watchdog-cloud";
 * 
 * const watchdog = initWatchdogCloud({
 *   serverUrl: "ws://localhost:9999",
 *   appName: "Quvna Web",
 * });
 * 
 * watchdog.interceptAxios(api);
 * watchdog.start();
 * ```
 */

// ── Types ───────────────────────────────────────────────────────────────────

export type WatchdogLogLevel = "verbose" | "debug" | "info" | "warning" | "error" | "critical";
export type NetworkEventStatus = "pending" | "completed" | "failed";
export type Platform = "WEB" | "MOBILE" | "BACKEND";

export interface WatchdogEvent {
  id: string;
  timestamp: number;
  type: string;
  sessionId: string;
  platform: Platform;
  appVersion?: string;
  userId?: string;
  deviceInfo?: string;
  [key: string]: unknown;
}

export interface NetworkEvent extends WatchdogEvent {
  type: "network";
  method: string;
  url: string;
  path: string;
  status: NetworkEventStatus;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  queryParams: Record<string, string>;
  statusCode?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
  errorMessage?: string;
  errorStackTrace?: string;
  durationMs?: number;
  page?: string;
  source: "client";
}

export interface LogEvent extends WatchdogEvent {
  type: "log";
  level: WatchdogLogLevel;
  message: string;
  title?: string;
  error?: string;
  stackTrace?: string;
  page?: string;
}

export interface RouteEvent extends WatchdogEvent {
  type: "route";
  action: "push" | "pop" | "replace" | "remove";
  routeName: string;
  fullStack: string[];
  depth: number;
  previousRouteName?: string;
  routeType?: "page" | "modal" | "dialog";
}

export interface ErrorEvent extends WatchdogEvent {
  type: "error";
  source: "network" | "log" | "js";
  headline: string;
  detail: string;
  stack?: string;
  page?: string;
}

export interface WatchdogCloudConfig {
  /** Watchdog Cloud WebSocket URL */
  serverUrl: string;
  /** Application name */
  appName: string;
  /** Application version */
  appVersion?: string;
  /** User ID (optional, set after login) */
  userId?: string;
  /** Enable/disable */
  enabled?: boolean;
  /** Auto-reconnect delay in ms */
  reconnectDelay?: number;
  /** Max reconnect delay in ms */
  maxReconnectDelay?: number;
  /** Enable console capture */
  enableConsoleCapture?: boolean;
  /** Enable error capture */
  enableErrorCapture?: boolean;
  /** Enable network capture */
  enableNetworkCapture?: boolean;
  /** Enable route capture */
  enableRouteCapture?: boolean;
}

// ── Utilities ───────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCurrentPage(): string {
  if (typeof window === "undefined") return "ssr";
  return window.location.pathname + window.location.search;
}

function getDeviceInfo(): string {
  if (typeof window === "undefined") return "server";
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const screen = `${window.screen.width}x${window.screen.height}`;
  return `${platform} | ${screen} | ${ua.slice(0, 50)}...`;
}

// ── Watchdog Cloud SDK ──────────────────────────────────────────────────────

class WatchdogCloudSDK {
  private config: Required<WatchdogCloudConfig>;
  private ws: WebSocket | null = null;
  private sessionId: string;
  private reconnectDelay: number;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;
  private eventQueue: WatchdogEvent[] = [];
  private originalConsole: Partial<typeof console> = {};
  private pendingRequests = new Map<string, { startTime: number }>();
  private routeStack: string[] = [];

  constructor(config: WatchdogCloudConfig) {
    this.config = {
      enabled: true,
      appVersion: "1.0.0",
      userId: undefined as unknown as string,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      enableConsoleCapture: true,
      enableErrorCapture: true,
      enableNetworkCapture: true,
      enableRouteCapture: true,
      ...config,
    };
    this.sessionId = generateId();
    this.reconnectDelay = this.config.reconnectDelay;
  }

  // ── Lifecycle ─────────────────────────────────────────────

  start() {
    if (this.isRunning || !this.config.enabled || typeof window === "undefined") return;
    this.isRunning = true;

    this.connect();
    this.setupConsoleCapture();
    this.setupErrorCapture();
  }

  stop() {
    this.isRunning = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.restoreConsole();
  }

  // ── WebSocket Connection ──────────────────────────────────

  private connect() {
    if (!this.isRunning) return;

    try {
      const url = new URL(this.config.serverUrl);
      url.searchParams.set("sessionId", this.sessionId);
      url.searchParams.set("platform", "WEB");
      url.searchParams.set("appName", this.config.appName);
      if (this.config.appVersion) url.searchParams.set("appVersion", this.config.appVersion);
      if (this.config.userId) url.searchParams.set("userId", this.config.userId);

      this.ws = new WebSocket(url.toString());

      this.ws.onopen = () => {
        console.log(`[Watchdog] Connected to cloud: ${this.config.serverUrl}`);
        this.reconnectDelay = this.config.reconnectDelay;

        // Send queued events
        while (this.eventQueue.length > 0) {
          const event = this.eventQueue.shift();
          if (event) this.sendEvent(event);
        }
      };

      this.ws.onclose = () => {
        this.ws = null;
        if (this.isRunning) {
          this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
          this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.config.maxReconnectDelay);
        }
      };

      this.ws.onerror = () => {
        // Silent fail, reconnect handled by onclose
      };
    } catch {
      this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  private sendEvent(event: WatchdogEvent) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: "event", event }));
      } catch {
        this.eventQueue.push(event);
      }
    } else {
      this.eventQueue.push(event);
      if (this.eventQueue.length > 1000) {
        this.eventQueue = this.eventQueue.slice(-500); // Keep last 500
      }
    }
  }

  // ── Event Builders ────────────────────────────────────────

  private createBaseEvent<T extends string>(type: T): WatchdogEvent & { type: T } {
    return {
      id: generateId(),
      timestamp: Date.now(),
      type: type as unknown as string,
      sessionId: this.sessionId,
      platform: "WEB",
      appVersion: this.config.appVersion,
      userId: this.config.userId,
      deviceInfo: getDeviceInfo(),
    } as WatchdogEvent & { type: T };
  }

  // ── Network Interceptor ───────────────────────────────────

  interceptAxios(axiosInstance: unknown) {
    if (!this.config.enableNetworkCapture || typeof window === "undefined") return;

    const axios = axiosInstance as {
      interceptors?: {
        request: { use: (fn: unknown) => number };
        response: { use: (onFulfilled: unknown, onRejected: unknown) => number };
      };
    };
    if (!axios.interceptors) return;

    // Request interceptor
    axios.interceptors.request.use((config: unknown) => {
      const cfg = config as {
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        data?: unknown;
        params?: Record<string, string>;
      };
      const id = generateId();
      const url = cfg.url || "";
      const method = (cfg.method || "GET").toUpperCase();

      let queryParams: Record<string, string> = {};
      try {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.forEach((value, key) => { queryParams[key] = value; });
      } catch { /* ignore */ }
      if (cfg.params) queryParams = { ...queryParams, ...cfg.params };

      const event: NetworkEvent = {
        ...this.createBaseEvent("network"),
        method,
        url,
        path: this.extractPath(url),
        status: "pending",
        requestHeaders: this.sanitizeHeaders(cfg.headers || {}),
        requestBody: cfg.data,
        queryParams,
        page: getCurrentPage(),
        source: "client",
      };

      this.pendingRequests.set(id, { startTime: Date.now() });
      (config as Record<string, unknown>).__watchdogId = id;
      (config as Record<string, unknown>).__watchdogEvent = event;

      this.sendEvent(event);
      return config;
    });

    // Response interceptor
    axios.interceptors.response.use(
      (response: unknown) => {
        this.handleResponse(response, false);
        return response;
      },
      (error: unknown) => {
        this.handleResponse(error, true);
        return Promise.reject(error);
      }
    );
  }

  private handleResponse(responseOrError: unknown, isError: boolean) {
    const res = responseOrError as {
      config?: Record<string, unknown>;
      status?: number;
      headers?: Record<string, string>;
      data?: unknown;
      response?: { status?: number; headers?: Record<string, string>; data?: unknown };
      message?: string;
      stack?: string;
    };
    const config = res.config;
    if (!config) return;

    const id = config.__watchdogId as string;
    const pendingEvent = config.__watchdogEvent as NetworkEvent;
    if (!id || !pendingEvent) return;

    const pending = this.pendingRequests.get(id);
    const durationMs = pending ? Date.now() - pending.startTime : undefined;
    this.pendingRequests.delete(id);

    if (isError) {
      const errorResponse = res.response;
      const updated: NetworkEvent = {
        ...pendingEvent,
        type: "network",
        status: "failed",
        statusCode: errorResponse?.status,
        responseHeaders: errorResponse?.headers ? this.sanitizeHeaders(errorResponse.headers) : undefined,
        responseBody: errorResponse?.data,
        errorMessage: res.message || "Request failed",
        errorStackTrace: res.stack,
        durationMs,
      };
      this.sendEvent(updated);
    } else {
      const updated: NetworkEvent = {
        ...pendingEvent,
        type: "network",
        status: "completed",
        statusCode: res.status,
        responseHeaders: res.headers ? this.sanitizeHeaders(res.headers) : undefined,
        responseBody: res.data,
        durationMs,
      };
      this.sendEvent(updated);
    }
  }

  private extractPath(url: string): string {
    try { return new URL(url, window.location.origin).pathname; } catch { return url; }
  }

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === "authorization") {
        sanitized[key] = value.startsWith("Bearer ") ? "Bearer ***" : "***";
      } else {
        sanitized[key] = String(value);
      }
    }
    return sanitized;
  }

  // ── Console Capture ───────────────────────────────────────

  private setupConsoleCapture() {
    if (!this.config.enableConsoleCapture || typeof window === "undefined") return;

    this.originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    console.log = (...args: unknown[]) => {
      this.originalConsole.log?.apply(console, args);
      this.createLogEvent("info", args);
    };
    console.info = (...args: unknown[]) => {
      this.originalConsole.info?.apply(console, args);
      this.createLogEvent("info", args);
    };
    console.warn = (...args: unknown[]) => {
      this.originalConsole.warn?.apply(console, args);
      this.createLogEvent("warning", args);
    };
    console.error = (...args: unknown[]) => {
      this.originalConsole.error?.apply(console, args);
      this.createLogEvent("error", args);
    };
    console.debug = (...args: unknown[]) => {
      this.originalConsole.debug?.apply(console, args);
      this.createLogEvent("debug", args);
    };
  }

  private restoreConsole() {
    if (this.originalConsole.log) console.log = this.originalConsole.log;
    if (this.originalConsole.info) console.info = this.originalConsole.info;
    if (this.originalConsole.warn) console.warn = this.originalConsole.warn;
    if (this.originalConsole.error) console.error = this.originalConsole.error;
    if (this.originalConsole.debug) console.debug = this.originalConsole.debug;
  }

  private createLogEvent(level: WatchdogLogLevel, args: unknown[]) {
    const message = args.map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return arg.message;
      try { return JSON.stringify(arg); } catch { return String(arg); }
    }).join(" ");

    const error = args.find((arg) => arg instanceof Error) as Error | undefined;

    const event: LogEvent = {
      ...this.createBaseEvent("log"),
      level,
      message,
      error: error?.message,
      stackTrace: error?.stack,
      page: getCurrentPage(),
    };

    this.sendEvent(event);
  }

  // ── Error Capture ─────────────────────────────────────────

  private setupErrorCapture() {
    if (!this.config.enableErrorCapture || typeof window === "undefined") return;

    window.addEventListener("error", (event) => {
      const errorEvent: ErrorEvent = {
        ...this.createBaseEvent("error"),
        source: "js",
        headline: event.message || "JavaScript Error",
        detail: `${event.filename}:${event.lineno}:${event.colno}`,
        stack: event.error?.stack,
        page: getCurrentPage(),
      };
      this.sendEvent(errorEvent);
    });

    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      const errorEvent: ErrorEvent = {
        ...this.createBaseEvent("error"),
        source: "js",
        headline: reason?.message || "Unhandled Promise Rejection",
        detail: String(reason),
        stack: reason?.stack,
        page: getCurrentPage(),
      };
      this.sendEvent(errorEvent);
    });
  }

  // ── Route Tracking ────────────────────────────────────────

  trackRoute(pathname: string, action: RouteEvent["action"] = "push") {
    if (!this.config.enableRouteCapture) return;

    const previousRoute = this.routeStack.length > 0 ? this.routeStack[this.routeStack.length - 1] : undefined;

    if (action === "push") {
      this.routeStack.push(pathname);
    } else if (action === "pop") {
      this.routeStack.pop();
    } else if (action === "replace") {
      if (this.routeStack.length > 0) this.routeStack[this.routeStack.length - 1] = pathname;
      else this.routeStack.push(pathname);
    }

    const event: RouteEvent = {
      ...this.createBaseEvent("route"),
      action,
      routeName: pathname,
      fullStack: [...this.routeStack],
      depth: this.routeStack.length,
      previousRouteName: previousRoute,
      routeType: "page",
    };

    this.sendEvent(event);
  }

  // ── Public Logging API ────────────────────────────────────

  log(level: WatchdogLogLevel, message: string, options?: { title?: string; error?: Error }) {
    const event: LogEvent = {
      ...this.createBaseEvent("log"),
      level,
      message,
      title: options?.title,
      error: options?.error?.message,
      stackTrace: options?.error?.stack,
      page: getCurrentPage(),
    };
    this.sendEvent(event);
  }

  debug(message: string, options?: { title?: string; error?: Error }) { this.log("debug", message, options); }
  info(message: string, options?: { title?: string; error?: Error }) { this.log("info", message, options); }
  warn(message: string, options?: { title?: string; error?: Error }) { this.log("warning", message, options); }
  error(message: string, options?: { title?: string; error?: Error }) { this.log("error", message, options); }
  critical(message: string, options?: { title?: string; error?: Error }) { this.log("critical", message, options); }

  // ── User Management ───────────────────────────────────────

  setUserId(userId: string) {
    this.config.userId = userId;
  }

  // ── Getters ───────────────────────────────────────────────

  get running() { return this.isRunning; }
  get session() { return this.sessionId; }
}

// ── Singleton ───────────────────────────────────────────────────────────────

let globalWatchdogCloud: WatchdogCloudSDK | null = null;

export function initWatchdogCloud(config: WatchdogCloudConfig): WatchdogCloudSDK {
  if (globalWatchdogCloud) {
    globalWatchdogCloud.stop();
  }
  globalWatchdogCloud = new WatchdogCloudSDK(config);
  return globalWatchdogCloud;
}

export function getWatchdogCloud(): WatchdogCloudSDK | null {
  return globalWatchdogCloud;
}

export { WatchdogCloudSDK };
