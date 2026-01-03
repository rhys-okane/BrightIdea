import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";
import { useMyDesignsState } from "@src/store/hooks/UseDesignsState";
import { useGalleryViewState } from "@src/store/hooks/UseGalleryViewState";
import { DesignGrid } from "./design-grid/DesignGrid";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@src/components/ui/pagination";
import type { PlayableDesign } from "@src/store/types/design/StoreDesign";
import { SearchInput } from "@src/components/ui/derived/SearchInput";
import { apiSearchDesigns } from "@src/lib/api/ApiSearchDesigns";
import { getPageNumbers } from "./utils/GetPageNumbers";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import { CLOUDFLARE_TURNSTILE_SITE_KEY } from "@src/lib/api/constants/ApiConstants";
import { AuthComponent } from "@src/components/app/router/design-picker/components/auth/AuthComponent";

const PAGE_SIZE = 14;

export const GalleryView: FC = () => {
  const [myDesigns] = useMyDesignsState();
  const [, setIsInGalleryView] = useGalleryViewState();
  const turnstileRef = useRef<TurnstileInstance>(null);

  const goBack = useCallback(() => {
    setIsInGalleryView(false);
  }, [setIsInGalleryView]);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 200);
  const [isLoading, setIsLoading] = useState(true);

  const [pages, setPages] = useState<Map<number, PlayableDesign[]>>(new Map());

  const hasMoreDesigns = useMemo(() => {
    if (!totalCount) return true;

    return totalCount > page * PAGE_SIZE;
  }, [totalCount, page]);

  const visibleDesigns = useMemo(() => {
    return pages.get(page) || [];
  }, [pages, page]);

  const onSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
    setPages(new Map());
    setTotalCount(999);
  }, []);

  const onDesignDelete = useCallback(() => {
    setPage(1);
    setPages(new Map());
    setTotalCount(999);
  }, []);

  useEffect(() => {
    (async () => {
      if (!hasMoreDesigns) return;
      if (pages.has(page)) return;

      const abortController = new AbortController();

      try {
        setIsLoading(true);
        const { designs: newDesigns, totalCount } = await apiSearchDesigns(
          debouncedSearch,
          page,
          PAGE_SIZE,
          abortController.signal
        );
        setIsLoading(false);
        setTotalCount(totalCount);

        setPages((prev) => {
          const newPlayableDesigns = newDesigns.map<PlayableDesign>(
            (design) => {
              const existingMyDesign = myDesigns.find(
                (d) => d.id === design.id
              );
              if (existingMyDesign) return existingMyDesign;

              return {
                ...design,
                isMine: false,
              };
            }
          );

          const newMap = new Map(prev);
          newMap.set(page, newPlayableDesigns);
          return newMap;
        });
      } catch {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
          toast.error("Failed to load designs. Please try again.");
        }
      }

      return () => abortController.abort();
    })();
    // Don't rely on things that will be reset before debounced search updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, hasMoreDesigns, myDesigns, page]);

  const pageNumbers = useMemo(
    () => getPageNumbers(page, PAGE_SIZE, totalCount),
    [page, totalCount]
  );

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
      <AuthComponent />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          Bright Idea
        </h1>
        <p className="text-lg text-gray-400">Gallery</p>
      </header>
      <section className="flex flex-col items-center gap-6 w-full">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          loading={isLoading}
        />

        <div className="w-full flex flex-col items-center gap-4">
          {!isLoading && visibleDesigns.length === 0 && (
            <div className="text-center text-gray-400">
              <p className="mb-4">
                No designs found. Create a new design to get started!
              </p>
            </div>
          )}

          <DesignGrid
            designs={visibleDesigns}
            turnstileRef={turnstileRef}
            onDesignDelete={onDesignDelete}
          />
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={isLoading || page === 1}
                onClick={() => setPage(page - 1)}
              />
            </PaginationItem>

            {pageNumbers.map((pageNum, index) => {
              if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={pageNum === page}
                    className="cursor-pointer"
                    disabled={isLoading}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(page + 1)}
                disabled={
                  !hasMoreDesigns ||
                  page >= Math.ceil(totalCount ?? 0 / PAGE_SIZE) ||
                  isLoading
                }
              />
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

      <Turnstile ref={turnstileRef} siteKey={CLOUDFLARE_TURNSTILE_SITE_KEY} />
    </main>
  );
};
