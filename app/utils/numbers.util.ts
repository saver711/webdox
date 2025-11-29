export const numbersUtil = {
	formatNumber: (num: number): string => {
		return new Intl.NumberFormat("en-US", {
			style: "decimal",
			maximumFractionDigits: 2,
			minimumFractionDigits: 0,
		}).format(num);
	},
};
