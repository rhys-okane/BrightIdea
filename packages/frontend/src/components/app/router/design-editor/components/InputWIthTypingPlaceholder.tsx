import {cn} from "@src/lib/utils";
import {type FC, useState, useEffect, type InputHTMLAttributes, useRef} from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
	defaultPlaceholder: string;
	placeholders: string[];
	value: string;
}

export const InputWithTypingPlaceholder: FC<Props> = ({defaultPlaceholder, placeholders, ...inputProps}) => {
	const [placeholder, setPlaceholder] = useState(defaultPlaceholder);

	const spanRef = useRef<HTMLSpanElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (spanRef.current && inputRef.current) {
			const width = spanRef.current.offsetWidth;
			inputRef.current.style.width = `${Math.max(width + 2, 10)}px`;
		}
	}, [inputProps.value, placeholder]);

	useEffect(() => {
		let place = "Give me a name...";
		let active = true;

		const typeAndDelete = async (isFirstRun: boolean = false) => {
			// wait 3 seconds before deleting the default placeholder on first run
			if (isFirstRun) {
				await new Promise(res => setTimeout(res, 3000));
			}

			// deleting phase for initial placeholder
			while (place.length > 0 && active) {
				place = place.slice(0, -1);
				setPlaceholder(place);
				await new Promise(res => setTimeout(res, 20));
			}

			const song = placeholders[Math.floor(Math.random() * placeholders.length)];

			// typing phase
			for (let i = 0; i < song.length && active; i++) {
				place += song[i];
				setPlaceholder(place);
				await new Promise(res => setTimeout(res, 100));
			}

			// wait 3 seconds before deleting
			await new Promise(res => setTimeout(res, 3000));

			// deleting phase
			while (place.length > 0 && active) {
				place = place.slice(0, -1);
				setPlaceholder(place);
				await new Promise(res => setTimeout(res, 20));
			}

			if (active) {
				typeAndDelete(); // loop again
			}
		};

		typeAndDelete(true);

		return () => {
			active = false;
		};
	}, [placeholders]);

	return (
		<div className="relative inline-block">
			<span
				ref={spanRef}
				className={cn("invisible absolute whitespace-pre font-space-mono text-4xl bold", inputProps.className)}
				aria-hidden="true"
			>
				{inputProps.value || placeholder}
			</span>
			<input
				{...inputProps}
				ref={inputRef}
				value={inputProps.value}
				onChange={e => {
					inputProps.onChange?.(e);
				}}
				className={cn(
					"border-none font-space-mono text-white placeholder:text-gray-500 text-center outline-none text-4xl bold bg-transparent min-w-0",
					inputProps.className,
				)}
				placeholder={placeholder}
			/>
		</div>
	);
};
