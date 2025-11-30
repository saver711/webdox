import Image from "next/image";
import type React from "react";

interface AuthorCardProps {
	name: string;
	linkedin: string;
	github: string;
	src: string;
	title: string;
}

const AuthorCard: React.FC<AuthorCardProps> = ({
	name,
	src,
	linkedin,
	github,
	title,
}) => {
	const wrapper: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		flexWrap: "wrap",
		gap: "16px",
		padding: "8px",
		borderRadius: "12px",
		background: "var(--fd-surface)",
		border: "1px solid var(--fd-border)",
		width: "100%",
	};

	const imgDiv: React.CSSProperties = {
		width: "50px",
		height: "50px",
		borderRadius: "50%",
		overflow: "hidden",
		position: "relative",
	};

	const nameSection: React.CSSProperties = {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		flexGrow: 1,
	};

	const nameStyle: React.CSSProperties = {
		fontSize: "18px",
		fontWeight: 600,
		color: "var(--color-fd-foreground)",
		margin: 0,
	};

	const titleStyle: React.CSSProperties = {
		fontSize: "12px",
		fontWeight: 500,
		color: "var(--color-fd-foreground)",
		opacity: 0.7,
		margin: 0,
	};

	const linksSection: React.CSSProperties = {
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
		gap: "6px",
		textAlign: "right",
		alignSelf: "flex-end",
		justifySelf: "flex-end",
	};

	const linkStyle: React.CSSProperties = {
		fontWeight: 500,
		textDecoration: "none",
		fontSize: "14px",
	};

	return (
		<div style={wrapper}>
			{/* Image */}
			<div style={imgDiv}>
				<Image
					fill
					sizes="50px"
					style={{ objectFit: "cover", margin: 0 }}
					src={src}
					alt={name}
				/>
			</div>

			{/* Name + title */}
			<div style={nameSection}>
				<p style={nameStyle}>{name}</p>
				<p style={titleStyle}>{title}</p>
			</div>

			{/* Links */}
			<div style={linksSection}>
				<a
					style={{ ...linkStyle, color: "var(--fd-link)" }}
					href={linkedin}
					target="_blank"
				>
					LinkedIn →
				</a>

				<a
					style={{ ...linkStyle, color: "var(--fd-text-secondary)" }}
					href={github}
					target="_blank"
				>
					GitHub →
				</a>
			</div>
		</div>
	);
};

export default AuthorCard;
