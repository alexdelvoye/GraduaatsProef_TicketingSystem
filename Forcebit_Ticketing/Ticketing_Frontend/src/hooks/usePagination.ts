import { useEffect, useMemo, useState } from "react";

type UsePaginationOptions = {
  pageSize: number;
  initialPage?: "first" | "last";
  resetKey?: string | number;
};

export function usePagination<T>(
  items: T[],
  { pageSize, initialPage = "first", resetKey }: UsePaginationOptions,
) {
  // The hook is intentionally item-based instead of ticket-specific. The same
  // state shape drives conversations, client rows, and ticket sections.
  const normalizedPageSize = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize));

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Conversations should open on the latest page, while normal lists usually
    // start at the first page. resetKey lets callers reset when data changes.
    setCurrentPage(initialPage === "last" ? totalPages : 1);
  }, [initialPage, resetKey, totalPages]);

  useEffect(() => {
    // If page size or data count changes, keep the current page valid.
    setCurrentPage((page) => Math.min(Math.max(page, 1), totalPages));
  }, [totalPages]);

  const startIndex =
    totalItems === 0 ? 0 : (currentPage - 1) * normalizedPageSize;
  const endIndex = Math.min(startIndex + normalizedPageSize, totalItems);

  const pageItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [endIndex, items, startIndex],
  );

  return {
    pageItems,
    currentPage,
    totalPages,
    totalItems,
    startItem: totalItems === 0 ? 0 : startIndex + 1,
    endItem: endIndex,
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
    goToPreviousPage: () => {
      setCurrentPage((page) => Math.max(1, page - 1));
    },
    goToNextPage: () => {
      setCurrentPage((page) => Math.min(totalPages, page + 1));
    },
  };
}
