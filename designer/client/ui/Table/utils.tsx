import {
    Row,
    RowData,
    RowModel,
    Table,
    TableOptionsResolved,
} from "@tanstack/react-table";

export function memo<TDeps extends readonly any[], TDepArgs, TResult>(
    getDeps: (depArgs?: TDepArgs) => [...TDeps],
    fn: (...args: NoInfer<[...TDeps]>) => TResult,
    opts: {
        key: any;
        debug?: () => any;
        onChange?: (result: TResult) => void;
    }
): (depArgs?: TDepArgs) => TResult {
    let deps: any[] = [];
    let result: TResult | undefined;

    return (depArgs) => {
        let depTime: number;
        if (opts.key && opts.debug) depTime = Date.now();

        const newDeps = getDeps(depArgs);

        const depsChanged =
            newDeps.length !== deps.length ||
            newDeps.some((dep: any, index: number) => deps[index] !== dep);

        if (!depsChanged) {
            return result!;
        }

        deps = newDeps;

        let resultTime: number;
        if (opts.key && opts.debug) resultTime = Date.now();

        result = fn(...newDeps);
        opts?.onChange?.(result);

        if (opts.key && opts.debug) {
            if (opts?.debug()) {
                const depEndTime =
                    Math.round((Date.now() - depTime!) * 100) / 100;
                const resultEndTime =
                    Math.round((Date.now() - resultTime!) * 100) / 100;
                const resultFpsPercentage = resultEndTime / 16;

                const pad = (str: number | string, num: number) => {
                    str = String(str);
                    while (str.length < num) {
                        str = " " + str;
                    }
                    return str;
                };

                console.info(
                    `%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`,
                    `
              font-size: .6rem;
              font-weight: bold;
              color: hsl(${Math.max(
                  0,
                  Math.min(120 - 120 * resultFpsPercentage, 120)
              )}deg 100% 31%);`,
                    opts?.key
                );
            }
        }

        return result!;
    };
}

export function getMemoOptions(
    tableOptions: Partial<TableOptionsResolved<any>>,
    debugLevel:
        | "debugAll"
        | "debugCells"
        | "debugTable"
        | "debugColumns"
        | "debugRows"
        | "debugHeaders",
    key: string,
    onChange?: (result: any) => void
) {
    return {
        debug: () => tableOptions?.debugAll ?? tableOptions[debugLevel],
        key: process.env.NODE_ENV === "development" && key,
        onChange,
    };
}

export function customGetExpandedRowModel<TData extends RowData>(): (
    table: Table<TData>
) => () => RowModel<TData> {
    return (table) =>
        memo(
            () => [
                table.getState().expanded,
                table.getPreExpandedRowModel(),
                table.options.paginateExpandedRows,
            ],
            (expanded, rowModel, paginateExpandedRows) => {
                if (
                    !rowModel.rows.length ||
                    (expanded !== true && !Object.keys(expanded ?? {}).length)
                ) {
                    return rowModel;
                }

                if (!paginateExpandedRows) {
                    // Only expand rows at this point if they are being paginated
                    return rowModel;
                }

                return expandRows(rowModel);
            },
            getMemoOptions(table.options, "debugTable", "getExpandedRowModel")
        );
}

export function expandRows<TData extends RowData>(rowModel: RowModel<TData>) {
    const expandedRows: Row<TData>[] = [];

    const handleRow = (row: Row<TData>) => {
        expandedRows.push(row);

        if (row.subRows?.length && row.getIsExpanded()) {
            row.subRows.forEach(handleRow);
        }
    };

    rowModel.rows.forEach(handleRow);

    return {
        rows: expandedRows,
        flatRows: rowModel.flatRows,
        rowsById: rowModel.rowsById,
    };
}

export function customGetPaginationRowModel<TData extends RowData>(opts?: {
    initialSync: boolean;
}): (table: Table<TData>) => () => RowModel<TData> {
    return (table) =>
        memo(
            () => [
                table.getState().pagination,
                table.getPrePaginationRowModel(),
                table.options.paginateExpandedRows
                    ? undefined
                    : table.getState().expanded,
            ],
            //@ts-ignore
            (pagination, rowModel) => {
                if (!rowModel.rows.length) {
                    return rowModel;
                }

                const { pageSize, pageIndex } = pagination;
                let { rows, flatRows, rowsById } = rowModel;
                const pageStart = pageSize * pageIndex;
                const pageEnd = pageStart + pageSize;

                rows = rows.slice(pageStart, pageEnd);

                let paginatedRowModel: RowModel<TData>;

                if (!table.options.paginateExpandedRows) {
                    paginatedRowModel = expandRows({
                        rows,
                        flatRows,
                        rowsById,
                    });
                } else {
                    paginatedRowModel = {
                        rows,
                        flatRows,
                        rowsById,
                    };
                }

                paginatedRowModel.flatRows = [];

                const handleRow = (row: Row<TData>) => {
                    paginatedRowModel.flatRows.push(row);
                    if (row.subRows.length) {
                        row.subRows.forEach(handleRow);
                    }
                };

                paginatedRowModel.rows.forEach(handleRow);

                return paginatedRowModel;
            },
            getMemoOptions(table.options, "debugTable", "getPaginationRowModel")
        );
}
