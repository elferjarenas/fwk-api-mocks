/**
 * Pagination utility for Cards V4
 * Handles cursor-based pagination with configurable page size
 */

export interface PaginationResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor?: string;
  totalItems: number;
  currentPage: number;
}

export class Pagination {
  /**
   * Paginate an array of items
   * @param items All items to paginate
   * @param pageNumber Current page number (1-based, optional)
   * @param itemsPerPage Items per page (default 15)
   */
  static paginate<T>(
    items: T[],
    pageNumber: string | undefined,
    itemsPerPage: number = 15
  ): PaginationResult<T> {
    const currentPage = pageNumber ? parseInt(pageNumber, 10) : 1;
    const validPage = currentPage > 0 ? currentPage : 1;

    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedItems = items.slice(startIndex, endIndex);
    const hasMore = endIndex < items.length;
    const nextCursor = hasMore ? (validPage + 1).toString() : undefined;

    return {
      items: paginatedItems,
      hasMore,
      nextCursor,
      totalItems: items.length,
      currentPage: validPage,
    };
  }

  /**
   * Calculate total pages
   */
  static getTotalPages(totalItems: number, itemsPerPage: number = 15): number {
    return Math.ceil(totalItems / itemsPerPage);
  }
}
