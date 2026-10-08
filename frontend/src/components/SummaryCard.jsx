import { useEffect, useState } from "react";

export default function SummaryCard({ label, value, detail, icon, tone = "green" }) {
	const target = Number(value);
	const canAnimate = Number.isFinite(target);
	const [displayValue, setDisplayValue] = useState(canAnimate ? 0 : value);

	useEffect(() => {
		if (!canAnimate) {
			setDisplayValue(value);
			return undefined;
		}

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setDisplayValue(target);
			return undefined;
		}

		let frame;
		const startedAt = performance.now();
		function animate(now) {
			const progress = Math.min(1, (now - startedAt) / 420);
			setDisplayValue(Math.round(target * (1 - (1 - progress) ** 3)));
			if (progress < 1) frame = requestAnimationFrame(animate);
		}
		frame = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frame);
	}, [canAnimate, target, value]);

	return (
		<article className={`summary-card tone-${tone}`}>
			{icon && <span className="summary-card-icon" aria-hidden="true">{icon}</span>}
			<p>{label}</p>
			<strong>{canAnimate ? Number(displayValue).toLocaleString() : displayValue ?? "-"}</strong>
			{detail && <span>{detail}</span>}
		</article>
	);
}