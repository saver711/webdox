import { describe, expect, it } from "vitest";
import { numbersUtil } from "./numbers.util";

describe("numbersUtil", () => {
	describe("formatNumber", () => {
		it("should format whole numbers correctly", () => {
			expect(numbersUtil.formatNumber(1000)).toBe("1,000");
			expect(numbersUtil.formatNumber(1000000)).toBe("1,000,000");
			expect(numbersUtil.formatNumber(0)).toBe("0");
		});

		it("should format decimal numbers correctly", () => {
			expect(numbersUtil.formatNumber(1000.12)).toBe("1,000.12");
			expect(numbersUtil.formatNumber(1000.1)).toBe("1,000.1");
			expect(numbersUtil.formatNumber(1000.123)).toBe("1,000.12");
		});

		it("should handle negative numbers", () => {
			expect(numbersUtil.formatNumber(-1000)).toBe("-1,000");
			expect(numbersUtil.formatNumber(-1000.12)).toBe("-1,000.12");
		});
	});
});
