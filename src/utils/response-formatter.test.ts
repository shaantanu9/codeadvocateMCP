import { describe, it, expect } from "vitest";
import { jsonResponse, codeResponse, textResponse } from "./response-formatter.js";

describe("Response Formatter", () => {
  describe("jsonResponse", () => {
    it("should format JSON response with data and message", () => {
      const data = { key: "value" };
      const message = "Success";
      const result = jsonResponse(data, message);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Success");
      expect(result.content[0].text).toContain('"key":"value"');
    });

    it("should format JSON response without message", () => {
      const data = { key: "value" };
      const result = jsonResponse(data);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain('"key":"value"');
    });
  });

  describe("codeResponse", () => {
    it("should format code response with language", () => {
      const code = "const x = 1;";
      const language = "typescript";
      const result = codeResponse(code, language);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("```typescript");
      expect(result.content[0].text).toContain(code);
      expect(result.content[0].text).toContain("```");
    });

    it("should format code response without language", () => {
      const code = "const x = 1;";
      const result = codeResponse(code);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("```");
      expect(result.content[0].text).toContain(code);
    });
  });

  describe("textResponse", () => {
    it("should format text response", () => {
      const text = "Simple text response";
      const result = textResponse(text);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe(text);
    });
  });
});



