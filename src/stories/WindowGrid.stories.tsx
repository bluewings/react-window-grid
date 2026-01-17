import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { WindowGrid } from '../core';

const meta: Meta<typeof WindowGrid> = {
  title: 'Components/WindowGrid',
  component: WindowGrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WindowGrid>;

const Cell = ({
  rowIndex,
  columnIndex,
  className,
  style,
}: {
  rowIndex: number;
  columnIndex: number;
  className: string;
  style: React.CSSProperties;
}) => (
  <div
    className={className}
    style={{
      ...style,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRight: '1px solid #e8e8e8',
      borderBottom: '1px solid #e8e8e8',
      background: rowIndex === 0 || columnIndex === 0 ? '#fafafa' : '#fff',
      fontSize: 14,
    }}
  >
    {rowIndex},{columnIndex}
  </div>
);

export const Basic: Story = {
  render: () => (
    <div style={{ width: 600, height: 400, border: '1px solid #e8e8e8' }}>
      <WindowGrid
        height={400}
        rowCount={100}
        rowHeight={40}
        columnCount={20}
        columnWidth={100}
      >
        {Cell}
      </WindowGrid>
    </div>
  ),
};

export const FixedRowsAndColumns: Story = {
  render: () => (
    <div style={{ width: 600, height: 400, border: '1px solid #e8e8e8' }}>
      <WindowGrid
        height={400}
        rowCount={100}
        rowHeight={40}
        columnCount={20}
        columnWidth={100}
        fixedTopCount={1}
        fixedLeftCount={1}
        fixedBottomCount={1}
        fixedRightCount={1}
      >
        {Cell}
      </WindowGrid>
    </div>
  ),
};

export const WithGuidelines: Story = {
  render: () => (
    <div style={{ width: 600, height: 400, border: '1px solid #e8e8e8' }}>
      <WindowGrid
        height={400}
        rowCount={100}
        rowHeight={40}
        columnCount={20}
        columnWidth={100}
        fixedTopCount={1}
        fixedLeftCount={1}
        guideline={true}
      >
        {Cell}
      </WindowGrid>
    </div>
  ),
};

export const VariableSize: Story = {
  render: () => {
    const columnWidths = Array.from({ length: 50 }, () => 75 + Math.floor(Math.random() * 50));
    const rowHeights = Array.from({ length: 50 }, () => 30 + Math.floor(Math.random() * 40));

    return (
      <div style={{ width: 600, height: 400, border: '1px solid #e8e8e8' }}>
        <WindowGrid
          height={400}
          rowCount={rowHeights.length}
          rowHeight={(index) => rowHeights[index]}
          columnCount={columnWidths.length}
          columnWidth={(index) => columnWidths[index]}
          fixedTopCount={1}
          fixedLeftCount={1}
        >
          {Cell}
        </WindowGrid>
      </div>
    );
  },
};

export const ScrollToExample: Story = {
  render: () => {
    const gridRef = useRef<{ scrollTo: (params: { rowIndex?: number; columnIndex?: number; duration?: number }) => void }>(null);

    const handleScrollTo = () => {
      gridRef.current?.scrollTo({
        rowIndex: 50,
        columnIndex: 10,
        duration: 1000,
      });
    };

    return (
      <div>
        <button onClick={handleScrollTo} style={{ marginBottom: 10 }}>
          Scroll to Row 50, Col 10
        </button>
        <div style={{ width: 600, height: 400, border: '1px solid #e8e8e8' }}>
          <WindowGrid
            ref={gridRef}
            height={400}
            rowCount={100}
            rowHeight={40}
            columnCount={20}
            columnWidth={100}
            fixedTopCount={1}
            fixedLeftCount={1}
          >
            {Cell}
          </WindowGrid>
        </div>
      </div>
    );
  },
};

export const LargeDataset: Story = {
  render: () => (
    <div style={{ width: 800, height: 600, border: '1px solid #e8e8e8' }}>
      <WindowGrid
        height={600}
        rowCount={10000}
        rowHeight={35}
        columnCount={100}
        columnWidth={120}
        fixedTopCount={1}
        fixedLeftCount={2}
        overscanCount={5}
      >
        {Cell}
      </WindowGrid>
    </div>
  ),
};
