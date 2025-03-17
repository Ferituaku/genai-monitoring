import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
  compact?: boolean; 
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  pageSize,
  compact = false // Default false
}) => {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = compact ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between w-full ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className={`text-gray-500 ${compact ? 'mr-2' : 'mr-4'}`}>
        Displays {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} from {totalItems} data
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={compact ? "h-6 w-6" : "h-8 w-8"}
        >
          <ChevronsLeft className={compact ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={compact ? "h-6 w-6" : "h-8 w-8"}
        >
          <ChevronLeft className={compact ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
        
        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => handlePageChange(page)}
            className={compact ? "h-6 w-6" : "h-8 w-8"}
          >
            {page}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={compact ? "h-6 w-6" : "h-8 w-8"}
        >
          <ChevronRight className={compact ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={compact ? "h-6 w-6" : "h-8 w-8"}
        >
          <ChevronsRight className={compact ? "h-3 w-3" : "h-4 w-4"} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;