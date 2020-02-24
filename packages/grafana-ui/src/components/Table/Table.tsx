import React, { FC, memo, useMemo } from 'react';
import { DataFrame } from '@grafana/data';
import { useSortBy, useTable, useBlockLayout, Cell } from 'react-table';
import { FixedSizeList } from 'react-window';
import useMeasure from 'react-use/lib/useMeasure';
import { getColumns, getTableRows } from './utils';
import { useTheme } from '../../themes';
import { TableFilterActionCallback } from './types';
import { getTableStyles } from './styles';
import { TableCell } from './TableCell';
import { Icon } from '../Icon/Icon';
import { getTextAlign } from './utils';

export interface Props {
  data: DataFrame;
  width: number;
  height: number;
  /** Minimal column width specified in pixels */
  columnMinWidth?: number;
  onCellClick?: TableFilterActionCallback;
}

export const Table: FC<Props> = memo(({ data, height, onCellClick, width, columnMinWidth }) => {
  const theme = useTheme();
  const [ref, headerRowMeasurements] = useMeasure();
  const tableStyles = getTableStyles(theme);

  const minWidth = columnMinWidth && columnMinWidth * data.fields.length;
  const tableWidth = minWidth && minWidth > width ? minWidth : width;

  const { getTableProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns: useMemo(() => getColumns(data, tableWidth), [data, tableWidth]),
      data: useMemo(() => getTableRows(data), [data]),
    },
    useSortBy,
    useBlockLayout
  );

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div {...row.getRowProps({ style })} className={tableStyles.row}>
          {row.cells.map((cell: Cell, index: number) => (
            <TableCell
              key={index}
              field={data.fields[cell.column.index]}
              tableStyles={tableStyles}
              cell={cell}
              onCellClick={onCellClick}
            />
          ))}
        </div>
      );
    },
    [prepareRow, rows]
  );

  return (
    <div {...getTableProps()} className={tableStyles.table}>
      <div>
        {headerGroups.map((headerGroup: any) => (
          <div className={tableStyles.thead} {...headerGroup.getHeaderGroupProps()} ref={ref}>
            {headerGroup.headers.map((column: any) =>
              renderHeaderCell(column, tableStyles.headerCell, data.fields[column.index])
            )}
          </div>
        ))}
      </div>
      <FixedSizeList
        height={height - headerRowMeasurements.height}
        itemCount={rows.length}
        itemSize={tableStyles.rowHeight}
        width={tableWidth}
      >
        {RenderRow}
      </FixedSizeList>
    </div>
  );
});

function renderHeaderCell(column: any, className: string, field: Field) {
  const headerProps = column.getHeaderProps(column.getSortByToggleProps());
  const fieldTextAlign = getTextAlign(field);

  if (fieldTextAlign) {
    headerProps.style.textAlign = fieldTextAlign;
  }

  return (
    <div className={className} {...headerProps}>
      {column.render('Header')}
      {column.isSorted && (column.isSortedDesc ? <Icon name="caret-down" /> : <Icon name="caret-up" />)}
    </div>
  );
}
