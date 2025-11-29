// app/page.tsx

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-6">
			<div className="max-w-2xl">
				<div className="flex items-center justify-center mb-10">
					<Image
						src="/webdocs-logo.png"
						alt="Webdocs Logo"
						width={220}
						height={120}
						className="opacity-90 dark:invert dark:brightness-200"
						priority
					/>
				</div>
				<h1 className="text-4xl font-bold sm:text-5xl">
					<span className="text-muted-foreground">
						You might not be following{" "}
					</span>

					<span className="tracking-tight">web development best practices</span>
				</h1>
				<p className="mt-4 text-lg">
					<strong className="tracking-tight">Webdocs</strong>{" "}
					<span className="text-muted-foreground">
						helps you build modern, consistent, and maintainable web apps — from
						components to utilities, architecture, and beyond.
					</span>
				</p>
				<div className="mt-8">
					<Link href="/docs">
						<Button size="lg" className="gap-2 cursor-pointer">
							Explore Docs
							<ArrowRight className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
			<footer className="absolute bottom-6 text-sm text-muted-foreground">
				Webdocs — Learn. Build. Standardize.
			</footer>
		</main>
	);
}
