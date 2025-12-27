"use client";

import { Crown, Edit2, User, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Person } from "../types";

interface PeopleManagerProps {
	people: Person[];
	defaultPayerId: string;
	onDefaultPayerChange: (id: string) => void;
	onAddPerson: (name: string) => void;
	onUpdatePerson: (id: string, name: string) => void;
	onDeletePerson: (id: string) => void;
}

const PeopleManager = ({
	people,
	defaultPayerId,
	onDefaultPayerChange,
	onAddPerson,
	onUpdatePerson,
	onDeletePerson,
}: PeopleManagerProps) => {
	const [newPersonName, setNewPersonName] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");

	const handleAddPerson = () => {
		if (newPersonName.trim()) {
			onAddPerson(newPersonName.trim());
			setNewPersonName("");
		}
	};

	const startEditing = (person: Person) => {
		setEditingId(person.id);
		setEditName(person.name);
	};

	const saveEdit = (id: string) => {
		if (editName.trim()) {
			onUpdatePerson(id, editName.trim());
		}
		setEditingId(null);
		setEditName("");
	};

	return (
		<div className="space-y-6" dir="rtl">
			{/* Add New Person */}
			<div className="bg-gray-800 rounded-xl p-4">
				<h3 className="font-bold text-white mb-3">إضافة شخص</h3>
				<div className="flex gap-2">
					<Input
						type="text"
						value={newPersonName}
						onChange={(e) => setNewPersonName(e.target.value)}
						placeholder="اسم الشخص"
						onKeyPress={(e) => e.key === "Enter" && handleAddPerson()}
						className="flex-1"
					/>
					<Button type="button" onClick={handleAddPerson}>
						<UserPlus className="h-5 w-5" />
						إضافة
					</Button>
				</div>
			</div>

			{/* People List */}
			<div>
				<h3 className="font-bold text-white mb-4">
					قائمة الأشخاص ({people.length})
				</h3>
				<div className="space-y-3">
					{people.map((person) => (
						<div
							key={person.id}
							className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:shadow-sm transition-shadow"
						>
							{editingId === person.id ? (
								// Edit Mode
								<div className="flex items-center gap-3">
									<Input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										className="flex-1"
									/>
									<Button
										type="button"
										onClick={() => saveEdit(person.id)}
										className="bg-green-500 hover:bg-green-600"
									>
										حفظ
									</Button>
									<Button
										type="button"
										onClick={() => setEditingId(null)}
										variant="outline"
									>
										إلغاء
									</Button>
								</div>
							) : (
								// View Mode
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={`p-2 rounded-lg ${
												defaultPayerId === person.id
													? "bg-yellow-600 text-yellow-100"
													: "bg-gray-700 text-gray-300"
											}`}
										>
											{defaultPayerId === person.id ? (
												<Crown className="h-5 w-5" />
											) : (
												<User className="h-5 w-5" />
											)}
										</div>
										<div>
											<div className="font-bold text-white">{person.name}</div>
											<div className="text-sm text-gray-400">
												{defaultPayerId === person.id
													? "الدافع الأساسي"
													: "مشارك"}
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button
											type="button"
											onClick={() => startEditing(person)}
											variant="ghost"
											size="icon"
										>
											<Edit2 className="h-4 w-4" />
										</Button>
										{person.id !== defaultPayerId && (
											<Button
												type="button"
												onClick={() => onDeletePerson(person.id)}
												variant="ghost"
												size="icon"
												className="text-red-600 hover:text-red-700"
											>
												<UserMinus className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Set Default Payer */}
			<div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
				<h3 className="font-bold text-yellow-300 mb-3">الدافع الأساسي</h3>
				<Select value={defaultPayerId} onValueChange={onDefaultPayerChange}>
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
	);
};

export default PeopleManager;
