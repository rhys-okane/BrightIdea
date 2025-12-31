import {Turnstile, type TurnstileInstance} from "@marsidev/react-turnstile";
import {Spinner} from "@src/components/ui/spinner";
import {useCallback, useEffect, useMemo, useRef, useState, type FC} from "react";
import {useMyDesignsState, useOthersDesignsState} from "@src/store/hooks/UseDesignsState";
import {useGalleryViewState} from "@src/store/hooks/UseGalleryViewState";
import {useIsLoadingDesignsState} from "@src/store/hooks/UseIsLoadingDesignsState";
import {DesignGrid} from "./design-grid/DesignGrid";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@src/components/ui/pagination";
import {apiFetchDesigns} from "@src/lib/api/FetchDesigns";
import type {PlayableDesign} from "@src/store/types/design/StoreDesign";
import {useHighBrowStore} from "@src/store/ZustandStore";

const PAGE_SIZE = 14;

export const GalleryView: FC = () => {
	const [myDesigns] = useMyDesignsState();
	const [othersDesigns] = useOthersDesignsState();
	const [isLoadingDesigns] = useIsLoadingDesignsState();
	const [, setIsInGalleryView] = useGalleryViewState();
	const turnstileRef = useRef<TurnstileInstance>(null);

	const showLoadingSpinner = useMemo(() => {
		return isLoadingDesigns && myDesigns.length === 0 && othersDesigns.length === 0 && window.navigator.onLine;
	}, [isLoadingDesigns, myDesigns.length, othersDesigns.length]);

	const goBack = useCallback(() => {
		setIsInGalleryView(false);
	}, [setIsInGalleryView]);

	const originalHasNextPage = useHighBrowStore(state => state.hasNextPage);

	const [page, setPage] = useState(1);
	const [fetchedPages, setFetchedPages] = useState<number[]>([1]);
	const [hasMoreDesigns, setHasMoreDesigns] = useState(originalHasNextPage);
	const [lastSeen, setLastSeen] = useState<Date | null>(
		[...myDesigns, ...othersDesigns].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt ||
			null,
	);

	// Create our own copy of the designs array to allow us to query for more
	const [designs, setDesigns] = useState<PlayableDesign[]>(
		[...myDesigns, ...othersDesigns]
			.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
			.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
	);

	const visibleDesigns = useMemo(() => {
		return designs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	}, [designs, page]);

	useEffect(() => {
		(async () => {
			if (!hasMoreDesigns) return;
			if (fetchedPages.includes(page)) return;

			setFetchedPages(prev => [...prev, page]);
			const {designs: newDesigns, hasNextPage} = await apiFetchDesigns(PAGE_SIZE, lastSeen);
			setLastSeen(newDesigns[newDesigns.length - 1]?.createdAt || null);
			setHasMoreDesigns(hasNextPage);

			if (newDesigns.length === 0) {
				setHasMoreDesigns(false);
				return;
			}

			// Merge in new designs, avoiding duplicates
			setDesigns(prevDesigns =>
				[...prevDesigns, ...newDesigns]
					.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
					.map(a => {
						const myDesign = myDesigns.find(d => d.id === a.id);
						if (myDesign) {
							return myDesign;
						}

						return {
							...a,
							isMine: false,
						};
					}),
			);
		})();
	}, [fetchedPages, hasMoreDesigns, lastSeen, myDesigns, page]);

	return (
		<main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
			<header className="mb-8 text-center">
				<h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Bright Idea</h1>
				<p className="text-lg text-gray-400">Gallery</p>
			</header>
			<section className="flex flex-col items-center gap-6 w-full">
				<div className="w-full flex flex-col items-center gap-4">
					{!showLoadingSpinner && designs.length === 0 && (
						<div className="text-center text-gray-400">
							<p className="mb-4">No designs found. Create a new design to get started!</p>
						</div>
					)}

					{showLoadingSpinner && <Spinner />}

					<DesignGrid designs={visibleDesigns} turnstileRef={turnstileRef} />
				</div>

				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious disabled={page <= 1} onClick={() => setPage(page => page - 1)} />
						</PaginationItem>
						<PaginationItem>
							<PaginationLink>{page}</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationNext disabled={!hasMoreDesigns} onClick={() => setPage(page => page + 1)} />
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</section>

			<button
				className="absolute top-0 left-0 m-4 px-4 py-2 bg-yellow-400 text-black rounded hover:bg-yellow-500 transition cursor-pointer"
				onClick={goBack}
			>
				Back
			</button>

			<Turnstile ref={turnstileRef} siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY} />
		</main>
	);
};
