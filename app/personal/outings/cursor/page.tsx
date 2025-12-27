"use client";

import { Calculator, Receipt, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExpenseForm from "./components/expense-form";
import ExpenseList from "./components/expense-list";
import PeopleManager from "./components/people-manager";
import Summary from "./components/summary";
import type { Expense, Person } from "./types";

const Page = () => {
	const [people, setPeople] = useState<Person[]>([]);
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [defaultPayerId, setDefaultPayerId] = useState<string>("");
	const [activeTab, setActiveTab] = useState<"people" | "expenses" | "summary">(
		"people",
	);

	// Update default payer when people list changes
	useEffect(() => {
		if (people.length > 0 && !people.some((p) => p.id === defaultPayerId)) {
			setDefaultPayerId(people[0].id);
		}
	}, [people, defaultPayerId]);

	const handleAddPerson = useCallback(
		(name: string) => {
			const newPerson: Person = {
				id: crypto.randomUUID(),
				name,
			};
			setPeople((prev) => [...prev, newPerson]);
			if (people.length === 0) {
				setDefaultPayerId(newPerson.id);
			}
		},
		[people.length],
	);

	const handleUpdatePerson = useCallback((id: string, name: string) => {
		setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
	}, []);

	const handleDeletePerson = useCallback(
		(id: string) => {
			if (people.length <= 1) {
				alert("يجب أن يكون هناك شخص واحد على الأقل");
				return;
			}
			setPeople((prev) => prev.filter((p) => p.id !== id));
			setExpenses((prev) =>
				prev.filter((e) => e.payerId !== id && !e.splitBetween.includes(id)),
			);
		},
		[people.length],
	);

	const handleAddExpense = useCallback(
		(expenseData: Omit<Expense, "id" | "createdAt">) => {
			const newExpense: Expense = {
				...expenseData,
				id: crypto.randomUUID(),
				createdAt: new Date(),
			};
			setExpenses((prev) => [...prev, newExpense]);
			setActiveTab("expenses");
		},
		[],
	);

	const handleUpdateExpense = useCallback(
		(id: string, updates: Partial<Expense>) => {
			setExpenses((prev) =>
				prev.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
			);
		},
		[],
	);

	const handleDeleteExpense = useCallback((id: string) => {
		setExpenses((prev) => prev.filter((exp) => exp.id !== id));
	}, []);

	const tabs = [
		{ id: "people" as const, label: "الأشخاص", icon: Users },
		{ id: "expenses" as const, label: "المصروفات", icon: Receipt },
		{ id: "summary" as const, label: "التسوية", icon: Calculator },
	];

	return (
		<div className="min-h-screen bg-gray-900 text-gray-100" dir="rtl">
			<div className="container mx-auto px-4 py-8 max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-white">
						حاسبة المصروفات المشتركة
					</h1>
				</div>

				{/* Tabs */}
				<div className="mb-6">
					<div className="flex gap-2 border-b border-gray-700">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 -mb-[1px] ${
										isActive
											? "border-blue-500 text-blue-400"
											: "border-transparent text-gray-400 hover:text-gray-200"
									}`}
								>
									<Icon className="h-5 w-5" />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Content */}
				<div className="space-y-6">
					{activeTab === "people" && (
						<Card>
							<CardHeader>
								<CardTitle>إدارة الأشخاص</CardTitle>
							</CardHeader>
							<CardContent>
								<PeopleManager
									people={people}
									defaultPayerId={defaultPayerId}
									onDefaultPayerChange={setDefaultPayerId}
									onAddPerson={handleAddPerson}
									onUpdatePerson={handleUpdatePerson}
									onDeletePerson={handleDeletePerson}
								/>
							</CardContent>
						</Card>
					)}

					{activeTab === "expenses" && (
						<div className="space-y-6">
							{people.length === 0 ? (
								<Card>
									<CardContent className="py-12 text-center text-gray-400">
										<Users className="h-12 w-12 mx-auto mb-4 text-gray-500" />
										<p>يرجى إضافة أشخاص أولاً من تبويب "الأشخاص"</p>
									</CardContent>
								</Card>
							) : (
								<>
									<Card>
										<CardHeader>
											<CardTitle>إضافة مصروف</CardTitle>
										</CardHeader>
										<CardContent>
											<ExpenseForm
												people={people}
												defaultPayerId={defaultPayerId}
												onSubmit={handleAddExpense}
											/>
										</CardContent>
									</Card>

									<Card>
										<CardHeader>
											<CardTitle>قائمة المصروفات ({expenses.length})</CardTitle>
										</CardHeader>
										<CardContent>
											<ExpenseList
												expenses={expenses}
												people={people}
												onUpdate={handleUpdateExpense}
												onDelete={handleDeleteExpense}
											/>
										</CardContent>
									</Card>
								</>
							)}
						</div>
					)}

					{activeTab === "summary" && (
						<div className="space-y-6">
							{people.length === 0 && (
								<Card>
									<CardContent className="py-12 text-center text-gray-500">
										<Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
										<p>يرجى إضافة أشخاص أولاً من تبويب "الأشخاص"</p>
									</CardContent>
								</Card>
							)}
							{people.length > 0 && expenses.length === 0 && (
								<Card>
									<CardContent className="py-12 text-center text-gray-400">
										<Receipt className="h-12 w-12 mx-auto mb-4 text-gray-500" />
										<p>
											لا توجد مصروفات مسجلة بعد. أضف مصروفات من تبويب
											"المصروفات"
										</p>
									</CardContent>
								</Card>
							)}
							{people.length > 0 && expenses.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>التسوية</CardTitle>
									</CardHeader>
									<CardContent>
										<Summary
											expenses={expenses}
											people={people}
											defaultPayerId={defaultPayerId}
										/>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Page;
