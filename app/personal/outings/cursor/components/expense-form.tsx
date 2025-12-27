"use client";

import { Plus } from "lucide-react";
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

interface ExpenseFormProps {
	people: Person[];
	defaultPayerId: string;
	onSubmit: (expense: Omit<Expense, "id" | "createdAt">) => void;
}

const ExpenseForm = ({
	people,
	defaultPayerId,
	onSubmit,
}: ExpenseFormProps) => {
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [taxPercentage, setTaxPercentage] = useState("14");
	const [payerId, setPayerId] = useState(defaultPayerId);
	const [selectedPeople, setSelectedPeople] = useState<string[]>(
		people.map((p) => p.id),
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!description || !amount || selectedPeople.length === 0) {
			alert("يرجى ملء جميع الحقول المطلوبة");
			return;
		}

		const parsedAmount = Number.parseFloat(amount) || 0;
		const parsedTax = Number.parseFloat(taxPercentage) || 0;

		if (!parsedAmount || parsedAmount <= 0) {
			alert("يرجى إدخال مبلغ صحيح");
			return;
		}

		if (selectedPeople.length === 0) {
			alert("يرجى اختيار شخص واحد على الأقل");
			return;
		}

		const expense: Omit<Expense, "id" | "createdAt"> = {
			description,
			amount: parsedAmount,
			taxPercentage: parsedTax,
			payerId,
			splitBetween: selectedPeople,
			isShared: true,
		};

		onSubmit(expense);

		// Reset form
		setDescription("");
		setAmount("");
		setTaxPercentage("14");
		setPayerId(defaultPayerId);
		setSelectedPeople(people.map((p) => p.id));
	};

	const togglePerson = (personId: string) => {
		setSelectedPeople((prev) =>
			prev.includes(personId)
				? prev.filter((id) => id !== personId)
				: [...prev, personId],
		);
	};

	const selectAll = () => {
		setSelectedPeople(people.map((p) => p.id));
	};

	const selectNone = () => {
		setSelectedPeople([]);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="الوصف"
					required
					className="w-full"
				/>
				<Input
					type="number"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					placeholder="المبلغ"
					step="0.01"
					min="0"
					required
					className="w-full"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Input
					type="number"
					value={taxPercentage}
					onChange={(e) => setTaxPercentage(e.target.value)}
					placeholder="الضريبة %"
					step="0.1"
					min="0"
					className="w-full"
				/>
				<Select value={payerId} onValueChange={setPayerId}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="من حاسب" />
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

			<div>
				<div className="flex items-center justify-between mb-3">
					<span className="text-sm font-medium text-gray-300">التقسيم</span>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={selectAll}
						>
							الكل
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={selectNone}
						>
							لا أحد
						</Button>
					</div>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					{people.map((person) => (
						<div key={person.id} className="flex items-center gap-2">
							<Checkbox
								id={`person-${person.id}`}
								checked={selectedPeople.includes(person.id)}
								onCheckedChange={() => togglePerson(person.id)}
							/>
							<label
								htmlFor={`person-${person.id}`}
								className="text-sm text-gray-300 cursor-pointer"
							>
								{person.name}
							</label>
						</div>
					))}
				</div>
			</div>

			{/* Submit Button */}
			<div className="pt-4">
				<Button type="submit" className="w-full md:w-auto">
					<Plus className="h-5 w-5" />
					إضافة المصروف
				</Button>
			</div>
		</form>
	);
};

export default ExpenseForm;
