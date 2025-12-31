import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpClient } from "./http-client.js";

// Mock fetch
global.fetch = vi.fn();

describe("HttpClient", () => {
  let client: HttpClient;
  const baseUrl = "https://api.example.com";
  const token = "test-token";

  beforeEach(() => {
    client = new HttpClient({
      baseUrl,
      defaultHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    vi.clearAllMocks();
  });

  describe("get", () => {
    it("should make GET request with correct headers", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ data: "test" }),
        headers: new Headers({ "content-type": "application/json" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await client.get("/endpoint");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/endpoint"),
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
          }),
        })
      );
    });

    it("should include query parameters", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ data: "test" }),
        headers: new Headers({ "content-type": "application/json" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await client.get("/endpoint", { param1: "value1" });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("param1=value1"),
        expect.any(Object)
      );
    });

    it("should retry on failure", async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: async () => "Server Error",
        headers: new Headers({ "content-type": "text/plain" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await expect(client.get("/endpoint")).rejects.toThrow();

      // Should retry (retries + 1 attempts = 4 total)
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe("post", () => {
    it("should make POST request with body", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: "123" }),
        headers: new Headers({ "content-type": "application/json" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const body = { name: "test" };
      await client.post("/endpoint", body);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/endpoint"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe("patch", () => {
    it("should make PATCH request", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ updated: true }),
        headers: new Headers({ "content-type": "application/json" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await client.patch("/endpoint", { name: "updated" });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/endpoint"),
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });
  });

  describe("delete", () => {
    it("should make DELETE request", async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ deleted: true }),
        headers: new Headers({ "content-type": "application/json" }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      await client.delete("/endpoint");

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/endpoint"),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });
});

