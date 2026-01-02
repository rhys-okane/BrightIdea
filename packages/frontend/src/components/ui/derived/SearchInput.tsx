import {useId, type FC} from "react";

import {LoaderCircleIcon, SearchIcon} from "lucide-react";

import {Input} from "@src/components/ui/input";

interface Props {
	value?: string;
	onChange?: (value: string) => void;
	loading?: boolean;
}

export const SearchInput: FC<Props> = ({value, onChange, loading}) => {
	const id = useId();

	return (
		<div className="w-full max-w-xs space-y-2">
			<div className="relative">
				<div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
					<SearchIcon className="size-4" />
					<span className="sr-only">Search</span>
				</div>
				<Input
					id={id}
					type="search"
					placeholder="Search..."
					value={value}
					onChange={e => onChange?.(e.target.value)}
					className="peer px-9 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none"
				/>
				{loading && (
					<div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50">
						<LoaderCircleIcon className="size-4 animate-spin" />
						<span className="sr-only">Loading...</span>
					</div>
				)}
			</div>
		</div>
	);
};
