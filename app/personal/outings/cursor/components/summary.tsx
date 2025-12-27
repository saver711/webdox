"use client";

import {
	ArrowDownRight,
	ArrowUpRight,
	CheckCircle,
	CheckCircle2,
	RefreshCw,
	Users,
	Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Expense, Person, Settlement, Transaction } from "../types";

interface SummaryProps {
	expenses: Expense[];
	people: Person[];
	defaultPayerId: string;
	compact?: boolean;
}

const Summary = ({
	expenses,
	people,
	defaultPayerId,
	compact = false,
}: SummaryProps) => {
	const [collectedTransactions, setCollectedTransactions] = useState<
		Set<string>
	>(new Set());

	const calculateSettlements = useMemo(() => {
		const balances: Record<string, number> = {};
		const payments: Record<string, number> = {};

		// Initialize balances and payments
		people.forEach((person) => {
			balances[person.id] = 0;
			payments[person.id] = 0;
		});

		// Calculate balances
		expenses.forEach((expense) => {
			const amount = expense.amount || 0;
			const tax = expense.taxPercentage || 0;
			const totalAmount = amount * (1 + tax / 100);
			// Always split equally among selected people
			const splitCount = expense.splitBetween.length || 1;
			const perPersonAmount = totalAmount / splitCount;

			// Add to payer's payments (what they actually paid)
			payments[expense.payerId] += totalAmount;

			// Subtract from each person's share (what they owe)
			expense.splitBetween.forEach((personId) => {
				balances[personId] -= perPersonAmount;
			});

			// Add to payer's balance (they paid for others)
			balances[expense.payerId] += totalAmount;
		});

		// Calculate net amounts (what each person should receive/pay)
		const netAmounts: Record<string, number> = {};
		people.forEach((person) => {
			// Net = what they paid - what they owe
			netAmounts[person.id] = balances[person.id];
		});

		// Calculate settlements (simplified algorithm)
		const settlements: Settlement[] = [];
		const transactions: Transaction[] = [];

		// Create arrays of debtors and creditors
		const debtors = people.filter((p) => netAmounts[p.id] < -0.01);
		const creditors = people.filter((p) => netAmounts[p.id] > 0.01);

		// Sort by amount
		debtors.sort((a, b) => netAmounts[a.id] - netAmounts[b.id]);
		creditors.sort((a, b) => netAmounts[b.id] - netAmounts[a.id]);

		let i = 0,
			j = 0;
		while (i < debtors.length && j < creditors.length) {
			const debtor = debtors[i];
			const creditor = creditors[j];
			const debt = -netAmounts[debtor.id];
			const credit = netAmounts[creditor.id];

			const amount = Math.min(debt, credit);

			if (amount > 0.01) {
				// Ignore trivial amounts
				transactions.push({
					from: debtor.id,
					to: creditor.id,
					amount: Number.parseFloat(amount.toFixed(2)),
				});
			}

			netAmounts[debtor.id] += amount;
			netAmounts[creditor.id] -= amount;

			if (Math.abs(netAmounts[debtor.id]) < 0.01) i++;
			if (Math.abs(netAmounts[creditor.id]) < 0.01) j++;
		}

		// Create final settlements
		people.forEach((person) => {
			const netAmount = Number.parseFloat(netAmounts[person.id].toFixed(2));
			const personTransactions = transactions.filter(
				(t) => t.from === person.id || t.to === person.id,
			);

			settlements.push({
				personId: person.id,
				netAmount,
				transactions: personTransactions,
			});
		});

		return { settlements, transactions, payments };
	}, [expenses, people]);

	const getPersonName = (id: string) => {
		const person = people.find((p) => p.id === id);
		return person ? person.name : "غير معروف";
	};

	const getTransactionId = (transaction: Transaction) => {
		return `${transaction.from}-${transaction.to}-${transaction.amount}`;
	};

	const toggleTransactionCollected = (transaction: Transaction) => {
		const id = getTransactionId(transaction);
		setCollectedTransactions((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const isTransactionCollected = (transaction: Transaction) => {
		return collectedTransactions.has(getTransactionId(transaction));
	};

	const { settlements, transactions, payments } = calculateSettlements;

	const allCollected =
		transactions.length > 0 && transactions.every(isTransactionCollected);
	const collectedCount = transactions.filter(isTransactionCollected).length;

	if (compact) {
		return (
			<div className="space-y-4" dir="rtl">
				<div className="grid grid-cols-2 gap-3">
					{settlements.map((settlement) => (
						<div
							key={settlement.personId}
							className={`p-3 rounded-xl ${
								settlement.netAmount > 0
									? "bg-green-900/30 border border-green-700"
									: settlement.netAmount < 0
										? "bg-red-900/30 border border-red-700"
										: "bg-gray-800 border border-gray-700"
							}`}
						>
							<div className="font-bold text-white mb-1">
								{getPersonName(settlement.personId)}
							</div>
							<div
								className={`text-lg font-bold ${
									settlement.netAmount > 0
										? "text-green-600"
										: settlement.netAmount < 0
											? "text-red-600"
											: "text-gray-600"
								}`}
							>
								{settlement.netAmount > 0 ? "+" : ""}
								{settlement.netAmount.toFixed(2)} ج
							</div>
							<div className="text-xs text-gray-400 mt-1">
								{settlement.netAmount > 0 ? "يستحق" : "مدين"}
							</div>
						</div>
					))}
				</div>

				{transactions.length > 0 && (
					<div className="pt-4 border-t border-gray-700">
						<div className="flex items-center justify-between mb-2">
							<h4 className="font-bold text-white">التحويلات المطلوبة</h4>
							{allCollected ? (
								<span className="text-xs text-green-400 flex items-center gap-1">
									<CheckCircle2 className="h-4 w-4" />
									تم التحصيل
								</span>
							) : (
								<span className="text-xs text-gray-400">
									{collectedCount} / {transactions.length}
								</span>
							)}
						</div>
						<div className="space-y-2">
							{transactions.slice(0, 3).map((transaction) => {
								const isCollected = isTransactionCollected(transaction);
								const transactionId = getTransactionId(transaction);
								return (
									<div
										key={transactionId}
										className={`flex items-center justify-between text-sm p-2 rounded ${
											isCollected ? "bg-green-900/20" : ""
										}`}
									>
										<span className="text-gray-300">
											{getPersonName(transaction.from)}
										</span>
										<div className="flex items-center gap-2">
											<span className="font-bold text-white">
												{transaction.amount.toFixed(2)} ج
											</span>
											{isCollected ? (
												<CheckCircle2 className="h-4 w-4 text-green-400" />
											) : (
												<ArrowUpRight className="h-4 w-4 text-gray-500" />
											)}
										</div>
										<span className="text-gray-300">
											{getPersonName(transaction.to)}
										</span>
									</div>
								);
							})}
							{transactions.length > 3 && (
								<div className="text-center text-sm text-gray-400">
									+ {transactions.length - 3} تحويلات أخرى
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-6" dir="rtl">
			{/* Summary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
							<Wallet className="h-5 w-5" />
						</div>
						<div>
							<div className="text-sm text-gray-400">إجمالي المصروفات</div>
							<div className="font-bold text-xl">
								{expenses
									.reduce((sum, exp) => {
										return sum + exp.amount * (1 + exp.taxPercentage / 100);
									}, 0)
									.toFixed(2)}{" "}
								ج
							</div>
						</div>
					</div>
				</div>

				<div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
					<div className="flex items-center gap-3 mb-3">
						<div className="p-2 bg-purple-900/50 text-purple-400 rounded-lg">
							<Users className="h-5 w-5" />
						</div>
						<div>
							<div className="text-sm text-gray-400">التحويلات المطلوبة</div>
							<div className="font-bold text-xl text-white">
								{transactions.length}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Per-Person Breakdown */}
			<div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
				<div className="p-4 border-b border-gray-700">
					<h3 className="font-bold text-white">تفصيل ما يحتاجه كل شخص</h3>
				</div>

				<div className="divide-y divide-gray-700">
					{people.map((person) => {
						const personOwes = transactions.filter((t) => t.from === person.id);
						const personReceives = transactions.filter(
							(t) => t.to === person.id,
						);
						const totalOwes = personOwes.reduce((sum, t) => sum + t.amount, 0);
						const totalReceives = personReceives.reduce(
							(sum, t) => sum + t.amount,
							0,
						);

						if (personOwes.length === 0 && personReceives.length === 0) {
							return null;
						}

						return (
							<div key={person.id} className="p-4 hover:bg-gray-700/50">
								<div className="font-bold text-white mb-3 text-lg">
									{getPersonName(person.id)}
									{person.id === defaultPayerId && (
										<span className="text-yellow-400 text-sm mr-2">
											(الدافع الأساسي)
										</span>
									)}
								</div>

								{personOwes.length > 0 && (
									<div className="mb-3">
										<div className="text-sm text-red-400 mb-2 font-medium">
											يحتاج أن يدفع:
										</div>
										<div className="space-y-1 mr-4">
											{personOwes.map((transaction, idx) => (
												<div
													key={idx}
													className="text-sm text-gray-300 flex items-center justify-between"
												>
													<span>
														{getPersonName(transaction.to)}:{" "}
														<span className="font-bold text-red-400">
															{transaction.amount.toFixed(2)} ج
														</span>
													</span>
												</div>
											))}
											{personOwes.length > 1 && (
												<div className="text-sm text-gray-400 pt-1 border-t border-gray-700">
													المجموع:{" "}
													<span className="font-bold text-red-400">
														{totalOwes.toFixed(2)} ج
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								{personReceives.length > 0 && (
									<div>
										<div className="text-sm text-green-400 mb-2 font-medium">
											يحتاج أن يستلم:
										</div>
										<div className="space-y-1 mr-4">
											{personReceives.map((transaction, idx) => (
												<div
													key={idx}
													className="text-sm text-gray-300 flex items-center justify-between"
												>
													<span>
														من {getPersonName(transaction.from)}:{" "}
														<span className="font-bold text-green-400">
															{transaction.amount.toFixed(2)} ج
														</span>
													</span>
												</div>
											))}
											{personReceives.length > 1 && (
												<div className="text-sm text-gray-400 pt-1 border-t border-gray-700">
													المجموع:{" "}
													<span className="font-bold text-green-400">
														{totalReceives.toFixed(2)} ج
													</span>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* Detailed Balances */}
			<div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
				<div className="p-4 border-b border-gray-700">
					<h3 className="font-bold text-white">تفصيل حساب كل شخص</h3>
				</div>

				<div className="divide-y divide-gray-700">
					{settlements.map((settlement) => (
						<div key={settlement.personId} className="p-4 hover:bg-gray-700/50">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg ${
											settlement.netAmount > 0
												? "bg-green-900/50 text-green-400"
												: settlement.netAmount < 0
													? "bg-red-900/50 text-red-400"
													: "bg-gray-700 text-gray-400"
										}`}
									>
										{settlement.netAmount > 0 ? (
											<ArrowDownRight className="h-5 w-5" />
										) : settlement.netAmount < 0 ? (
											<ArrowUpRight className="h-5 w-5" />
										) : (
											<RefreshCw className="h-5 w-5" />
										)}
									</div>
									<div>
										<div className="font-bold text-white">
											{getPersonName(settlement.personId)}
											{settlement.personId === defaultPayerId && (
												<span className="text-yellow-400 text-sm mr-2">
													(الدافع الأساسي)
												</span>
											)}
										</div>
										<div className="text-sm text-gray-400">
											دفع {payments[settlement.personId]?.toFixed(2) || "0.00"}{" "}
											ج
										</div>
									</div>
								</div>

								<div
									className={`text-xl font-bold ${
										settlement.netAmount > 0
											? "text-green-600"
											: settlement.netAmount < 0
												? "text-red-600"
												: "text-gray-600"
									}`}
								>
									{settlement.netAmount > 0 ? "+" : ""}
									{settlement.netAmount.toFixed(2)} ج
								</div>
							</div>

							{/* Transactions for this person */}
							{settlement.transactions.length > 0 && (
								<div className="mr-12 pr-4 border-r-2 border-gray-700">
									<div className="text-sm text-gray-400 mb-2">التحويلات:</div>
									<div className="space-y-2">
										{settlement.transactions.map((transaction, idx) => (
											<div
												key={idx}
												className="flex items-center justify-between text-sm"
											>
												<div className="flex items-center gap-2">
													{transaction.from === settlement.personId ? (
														<>
															<span className="text-gray-300">يدفع لـ</span>
															<span className="font-medium">
																{getPersonName(transaction.to)}
															</span>
														</>
													) : (
														<>
															<span className="text-gray-300">يستلم من</span>
															<span className="font-medium">
																{getPersonName(transaction.from)}
															</span>
														</>
													)}
												</div>
												<span
													className={`font-bold ${
														transaction.from === settlement.personId
															? "text-red-600"
															: "text-green-600"
													}`}
												>
													{transaction.amount.toFixed(2)} ج
												</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Settlement Instructions */}
			{transactions.length > 0 && (
				<div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
					<div className="flex items-center justify-between mb-3">
						<h4 className="font-bold text-blue-300">تعليمات التسوية</h4>
						{allCollected ? (
							<div className="flex items-center gap-2 text-green-400">
								<CheckCircle2 className="h-5 w-5" />
								<span className="font-medium">تم التسوية بالكامل</span>
							</div>
						) : (
							<span className="text-sm text-gray-400">
								{collectedCount} / {transactions.length} تم التحصيل
							</span>
						)}
					</div>
					{allCollected ? (
						<div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
							<CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-400" />
							<p className="text-green-300 font-medium text-lg">
								تم تحصيل جميع المبالغ! 🎉
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{transactions.map((transaction, idx) => {
								const isCollected = isTransactionCollected(transaction);
								const transactionId = getTransactionId(transaction);
								return (
									<div
										key={transactionId}
										className={`flex items-center justify-between p-3 rounded-lg border ${
											isCollected
												? "bg-green-900/20 border-green-700"
												: "bg-gray-800 border-gray-700"
										}`}
									>
										<div className="flex items-center gap-3 flex-1">
											<div className="text-blue-400 font-bold">#{idx + 1}</div>
											<div className="text-gray-300">
												<span className="font-medium">
													{getPersonName(transaction.from)}
												</span>{" "}
												يدفع{" "}
												<span className="font-bold text-red-400">
													{transaction.amount.toFixed(2)} ج
												</span>{" "}
												لـ{" "}
												<span className="font-medium">
													{getPersonName(transaction.to)}
												</span>
											</div>
										</div>
										<Button
											type="button"
											variant={isCollected ? "default" : "outline"}
											size="sm"
											onClick={() => toggleTransactionCollected(transaction)}
											className={
												isCollected ? "bg-green-600 hover:bg-green-700" : ""
											}
										>
											{isCollected ? (
												<>
													<CheckCircle2 className="h-4 w-4" />
													تم التحصيل
												</>
											) : (
												<>
													<CheckCircle className="h-4 w-4" />
													تم التحصيل
												</>
											)}
										</Button>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Summary;
