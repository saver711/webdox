export interface Person {
	id: string;
	name: string;
}

export interface Expense {
	id: string;
	description: string;
	amount: number;
	taxPercentage: number;
	payerId: string; // من حاسب على الحاجة
	splitBetween: string[]; // الأشخاص اللي الحاجة تتقسم عليهم
	isShared: boolean; // هل الحاجة مشتركة (تتقسم بالتساوي)
	createdAt: Date;
}

export interface Transaction {
	from: string; // من
	to: string; // لـ
	amount: number; // المبلغ
}

export interface Settlement {
	personId: string;
	netAmount: number; // موجب = يستحق، سالب = مدين
	transactions: Transaction[];
}
