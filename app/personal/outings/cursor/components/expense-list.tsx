"use client";

import { Check, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Expense, Person } from "../types";

interface ExpenseListProps {
	expenses: Expense[];
	people: Person[];
	onUpdate: (id: string, updates: Partial<Expense>) => void;
	onDelete: (id: string) => void;
}

const ExpenseList = ({
	expenses,
	people,
	onUpdate,
	onDelete,
}: ExpenseListProps) => {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<Partial<Expense>>({});

	const startEditing = (expense: Expense) => {
		setEditingId(expense.id);
		setEditForm({
			description: expense.description,
			amount: expense.amount,
			taxPercentage: expense.taxPercentage,
			payerId: expense.payerId,
			splitBetween: [...expense.splitBetween],
		});
	};

	const saveEditing = (id: string) => {
		onUpdate(id, { ...editForm, isShared: true });
		setEditingId(null);
		setEditForm({});
	};

	const cancelEditing = () => {
		setEditingId(null);
		setEditForm({});
	};

	const getPersonName = (id: string) => {
		const person = people.find((p) => p.id === id);
		return person ? person.name : "غير معروف";
	};

	const calculateTotal = (expense: Expense) => {
		const amount = expense.amount || 0;
		const tax = expense.taxPercentage || 0;
		return amount * (1 + tax / 100);
	};

	const calculatePerPerson = (expense: Expense) => {
		const total = calculateTotal(expense);
		// Always split equally among selected people
		const splitCount = expense.splitBetween.length || 1;
		return total / splitCount;
	};

	const togglePersonInEdit = (personId: string) => {
		const currentSplit = editForm.splitBetween || [];
		const newSplit = currentSplit.includes(personId)
			? currentSplit.filter((id) => id !== personId)
			: [...currentSplit, personId];
		setEditForm({ ...editForm, splitBetween: newSplit });
	};

	return (
		<div className="space-y-4" dir="rtl">
			{expenses.length === 0 ? (
				<div className="text-center py-12 text-gray-400">
					<p>لا توجد مصروفات مسجلة بعد</p>
				</div>
			) : (
				expenses.map((expense) => (
					<div
						key={expense.id}
						className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
					>
						{editingId === expense.id ? (
							// Edit Mode
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<Input
										type="text"
										value={editForm.description || ""}
										onChange={(e) =>
											setEditForm({ ...editForm, description: e.target.value })
										}
										placeholder="الوصف"
									/>
									<Input
										type="number"
										value={editForm.amount || ""}
										onChange={(e) =>
											setEditForm({
												...editForm,
												amount: parseFloat(e.target.value),
											})
										}
										placeholder="المبلغ"
										step="0.01"
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<div>
										<label
											htmlFor="tax-percentage"
											className="block text-sm font-medium text-gray-300 mb-2"
										>
											نسبة الضريبة (%)
										</label>
										<Input
											id="tax-percentage"
											type="number"
											value={editForm.taxPercentage || ""}
											onChange={(e) =>
												setEditForm({
													...editForm,
													taxPercentage: parseFloat(e.target.value),
												})
											}
											step="0.1"
										/>
									</div>
									<div>
										<label
											htmlFor="payer-id"
											className="block text-sm font-medium text-gray-300 mb-2"
										>
											من حاسب؟
										</label>
										<Select
											value={editForm.payerId || ""}
											onValueChange={(value) =>
												setEditForm({ ...editForm, payerId: value })
											}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{people.map((person) => (
													<SelectItem key={person.id} value={person.id}>
														{person.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div>
									<span className="block text-sm font-medium text-gray-700 mb-2">
										التقسيم بين الأشخاص
									</span>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
										{people.map((person) => (
											<div key={person.id} className="flex items-center gap-2">
												<Checkbox
													id={`edit-person-${expense.id}-${person.id}`}
													checked={
														editForm.splitBetween?.includes(person.id) || false
													}
													onCheckedChange={() => togglePersonInEdit(person.id)}
												/>
												<label
													htmlFor={`edit-person-${expense.id}-${person.id}`}
													className="text-sm text-gray-300 cursor-pointer"
												>
													{person.name}
												</label>
											</div>
										))}
									</div>
								</div>

								<div className="flex gap-2 justify-end">
									<Button
										onClick={() => saveEditing(expense.id)}
										className="bg-green-500 hover:bg-green-600"
									>
										<Check className="h-4 w-4" />
										حفظ
									</Button>
									<Button onClick={cancelEditing} variant="outline">
										<X className="h-4 w-4" />
										إلغاء
									</Button>
								</div>
							</div>
						) : (
							// View Mode
							<>
								<div className="flex justify-between items-start mb-3">
									<div>
										<h4 className="font-bold text-white">
											{expense.description}
										</h4>
										<div className="flex items-center gap-3 mt-1">
											<span className="text-sm text-gray-400">
												{expense.createdAt.toLocaleDateString("ar-EG")}
											</span>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={() => startEditing(expense)}
											variant="ghost"
											size="icon"
										>
											<Edit2 className="h-4 w-4" />
										</Button>
										<Button
											onClick={() => onDelete(expense.id)}
											variant="ghost"
											size="icon"
											className="text-red-400 hover:text-red-300"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<div>
										<div className="text-sm text-gray-400">المبلغ</div>
										<div className="font-bold text-white">
											{expense.amount.toFixed(2)} ج
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-400">
											+ ضريبة {expense.taxPercentage}%
										</div>
										<div className="font-bold text-white">
											{((expense.amount * expense.taxPercentage) / 100).toFixed(
												2,
											)}{" "}
											ج
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-400">الإجمالي</div>
										<div className="font-bold text-blue-400">
											{calculateTotal(expense).toFixed(2)} ج
										</div>
									</div>
									<div>
										<div className="text-sm text-gray-400">لكل شخص</div>
										<div className="font-bold text-green-400">
											{calculatePerPerson(expense).toFixed(2)} ج
										</div>
									</div>
								</div>

								<div className="mt-4 pt-4 border-t border-gray-700">
									<div className="flex justify-between items-center">
										<div className="text-sm text-gray-300">
											حاسب:{" "}
											<span className="font-medium">
												{getPersonName(expense.payerId)}
											</span>
										</div>
										<div className="text-sm text-gray-300">
											<span className="font-medium">
												{expense.splitBetween.length}
											</span>{" "}
											شخص
										</div>
									</div>
									<div className="flex flex-wrap gap-1 mt-2">
										{expense.splitBetween.map((personId) => (
											<span
												key={personId}
												className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
											>
												{getPersonName(personId)}
											</span>
										))}
									</div>
								</div>
							</>
						)}
					</div>
				))
			)}
		</div>
	);
};

export default ExpenseList;
