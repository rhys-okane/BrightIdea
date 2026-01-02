type PageNumbers = (number | "ellipsis-start" | "ellipsis-end")[];

export const getPageNumbers = (currentPage: number, pageSize: number, itemCount: number | undefined): PageNumbers => {
	if (!itemCount) return ["ellipsis-start", 1, 2, 3, "ellipsis-end"];

	const pages: PageNumbers = [];
	const maxVisible = 3; // Number of page buttons to show
	const totalPages = Math.ceil(itemCount / pageSize);

	if (totalPages <= maxVisible) {
		// Show all pages if total is small
		for (let i = 1; i <= totalPages; i++) {
			pages.push(i);
		}

		return pages;
	}

	// Calculate the range to show
	let start, end;

	if (currentPage === 1) {
		// Special case: page 1 shows 1, 2, 3
		start = 1;
		end = maxVisible;
	} else {
		// Put current page in the middle
		start = currentPage - 1;
		end = currentPage + 1;

		// Adjust if we're near the end
		if (end > totalPages) {
			end = totalPages;
			start = Math.max(1, end - maxVisible + 1);
		}
	}

	// Add page numbers
	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	// Add ellipsis if not showing the last page
	if (end < totalPages) {
		pages.push("ellipsis-end");
	}

	return pages;
};
