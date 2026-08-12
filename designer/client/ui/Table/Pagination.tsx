import React from "react";
import { Table } from "@tanstack/react-table";

type Props<T> = {
    table: Table<T>;
    totalNumber: number;
    itemsPerPage: number;
};

function Pagination<T>(props: Props<T>) {
    const currentPage = props.table.getState().pagination.pageIndex + 1;
    const totalPages = Math.ceil(props.totalNumber / props.itemsPerPage);
    const conditionsForPreviousElip = ![1, 2, 3].includes(currentPage);
    const consecutivePrevious = currentPage > 1;
    const consecutiveNext = currentPage < totalPages;
    const conditionsForNextElip =
        !!totalPages &&
        ![totalPages, totalPages - 1, totalPages - 2].includes(currentPage);
    const conditionForFirst = currentPage >= 3;
    const conditionForLast = currentPage <= totalPages - 2;

    return (
        <nav
            className="govuk-pagination"
            role="navigation"
            aria-label="results"
        >
            {props.table.getCanPreviousPage() && (
                <div className="govuk-pagination__prev">
                    <a
                        className="govuk-link govuk-pagination__link"
                        href="#"
                        rel="prev"
                        onClick={(e) => {
                            e.preventDefault();
                            props.table.previousPage();
                        }}
                    >
                        <svg
                            className="govuk-pagination__icon govuk-pagination__icon--prev"
                            xmlns="http://www.w3.org/2000/svg"
                            height="13"
                            width="15"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 15 13"
                        >
                            <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
                        </svg>
                        <span className="govuk-pagination__link-title">
                            Previous
                        </span>
                    </a>
                </div>
            )}
            <ul className="govuk-pagination__list">
                {conditionForFirst && (
                    <li className="govuk-pagination__item">
                        <a
                            className="govuk-link govuk-pagination__link"
                            href="#"
                            aria-label={`Page 1`}
                            onClick={(e) => {
                                e.preventDefault();
                                props.table.setPageIndex(0);
                            }}
                        >
                            1
                        </a>
                    </li>
                )}
                {conditionsForPreviousElip && (
                    <li className="govuk-pagination__item govuk-pagination__item--ellipses">
                        ...
                    </li>
                )}
                {consecutivePrevious && (
                    <li className="govuk-pagination__item">
                        <a
                            className="govuk-link govuk-pagination__link"
                            href="#"
                            aria-label={`Page ${currentPage - 1}`}
                            onClick={(e) => {
                                e.preventDefault();
                                props.table.setPageIndex(currentPage - 2);
                            }}
                        >
                            {currentPage - 1}
                        </a>
                    </li>
                )}
                <li className="govuk-pagination__item govuk-pagination__item--current">
                    <a
                        className="govuk-link govuk-pagination__link"
                        href="#"
                        aria-label={`Page ${currentPage}`}
                        aria-current="page"
                        onClick={(e) => e.preventDefault()}
                    >
                        {currentPage}
                    </a>
                </li>
                {consecutiveNext && (
                    <li className="govuk-pagination__item">
                        <a
                            className="govuk-link govuk-pagination__link"
                            href="#"
                            aria-label={`Page ${currentPage + 1}`}
                            onClick={(e) => {
                                e.preventDefault();
                                props.table.setPageIndex(currentPage);
                            }}
                        >
                            {currentPage + 1}
                        </a>
                    </li>
                )}
                {conditionsForNextElip && (
                    <li className="govuk-pagination__item govuk-pagination__item--ellipses">
                        ...
                    </li>
                )}
                {conditionForLast && (
                    <li className="govuk-pagination__item">
                        <a
                            className="govuk-link govuk-pagination__link"
                            href="#"
                            aria-label={`Page ${totalPages}`}
                            onClick={(e) => {
                                e.preventDefault();
                                props.table.setPageIndex(totalPages - 1);
                            }}
                        >
                            {totalPages}
                        </a>
                    </li>
                )}
            </ul>
            {props.table.getCanNextPage() && (
                <div className="govuk-pagination__next">
                    <a
                        className="govuk-link govuk-pagination__link"
                        href="#"
                        rel="next"
                        onClick={(e) => {
                            e.preventDefault();
                            props.table.nextPage();
                        }}
                    >
                        <span className="govuk-pagination__link-title">
                            Next
                        </span>{" "}
                        <svg
                            className="govuk-pagination__icon govuk-pagination__icon--next"
                            xmlns="http://www.w3.org/2000/svg"
                            height="13"
                            width="15"
                            aria-hidden="true"
                            focusable="false"
                            viewBox="0 0 15 13"
                        >
                            <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
                        </svg>
                    </a>
                </div>
            )}
        </nav>
    );
}

export default Pagination;
