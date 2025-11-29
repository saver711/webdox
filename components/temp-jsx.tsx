"use client";
import { useState } from "react";

type HelloProps = {
	readonly name: string;
};

export const Hello = ({ name }: HelloProps) => {
	const [count, setCount] = useState(0);
	return (
		<>
			<p className="text-lg font-semibold text-green-500">
				Hello, {name}! This a react component rendered inside the documentation
			</p>

			<button type="button" onClick={() => setCount(count + 1)}>
				Increment
			</button>
			<p>Count: {count}</p>
		</>
	);
};
