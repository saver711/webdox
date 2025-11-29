import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX({
	configPath: "source.config.mjs",
});

const nextConfig = {
	output: "standalone",
};

export default withMDX(nextConfig);
