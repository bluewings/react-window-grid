import { useMemo } from 'react';
import { Metadata, ItemPosition } from './useMetadata';
import styles from '../components/WindowGrid/WindowGrid.module.scss';

function useItems(rowRange: number[], colRange: number[], getCachedStyle: Function) {
  const [overscanRowStartIndex, overscanRowStopIndex] = rowRange;
  const [overscanColumnStartIndex, overscanColumnStopIndex] = colRange;
  return useMemo(() => {
    // const

    const items = [];

    for (let rowIndex = overscanRowStartIndex; rowIndex < overscanRowStopIndex; rowIndex++) {
      let rowType = [];
      if (rowIndex === overscanRowStartIndex) {
        rowType.push('first');
      }
      if (rowIndex === overscanRowStopIndex - 1) {
        rowType.push('last');
      }
      for (let colIndex = overscanColumnStartIndex; colIndex < overscanColumnStopIndex; colIndex++) {
        const key = rowIndex + '_' + colIndex;

        let colType = [];
        if (colIndex === overscanColumnStartIndex) {
          colType.push('first');
        }
        if (colIndex === overscanColumnStopIndex - 1) {
          colType.push('last');
        }
        const { content, style } = getCachedStyle(rowIndex, colIndex, rowType, colType);
        items.push(content);

        //   <div key={key} style={style} className={(rowIndex + colIndex) % 2 ? styles.odd : styles.even}>
        //     {content}
        //     {/* {rowIndex}, {colIndex} */}
        //   </div>,
        // );
      }
    }
    return items;
  }, [overscanRowStartIndex, overscanRowStopIndex, overscanColumnStartIndex, overscanColumnStopIndex, getCachedStyle]);
}

function useSections(
  rowMetadata: Metadata,
  columnMetadata: Metadata,
  overscanRowStartIndex: number,
  overscanRowStopIndex: number,
  overscanColumnStartIndex: number,
  overscanColumnStopIndex: number,
  contentWidth: number,
  contentHeight: number,
  getCachedStyle: Function,
  classNames: any,
) {
  const range = {
    top: rowMetadata.pre.range,
    bottom: rowMetadata.post.range,
    left: columnMetadata.pre.range,
    right: columnMetadata.post.range,
    // middle_v: [overscanRowStartIndex, overscanRowStopIndex + 1],
    middle_v: [
      Math.max(rowMetadata.mid.range[0], overscanRowStartIndex),
      Math.min(rowMetadata.mid.range[1], overscanRowStopIndex + 1),
    ],
    middle_h: [
      Math.max(columnMetadata.mid.range[0], overscanColumnStartIndex),
      Math.min(columnMetadata.mid.range[1], overscanColumnStopIndex + 1),
    ],
    // middle_h: [
    //   overscanColumnStartIndex,
    //   overscanColumnStopIndex + 1,

    // ],
  };

  const sections = [
    {
      key: 'top',
      className: `${classNames.SECTION} ${classNames.SECTION_TOP} ${styles.sticky}`,
      style: { top: 0 },
      items: useItems(range.top, range.middle_h, getCachedStyle),
    },

    {
      key: 'left',
      className: `${classNames.SECTION} ${classNames.SECTION_LEFT} ${styles.sticky}`,
      style: { left: 0 },
      items: useItems(range.middle_v, range.left, getCachedStyle),
    },
    {
      key: 'right',
      className: `${classNames.SECTION} ${classNames.SECTION_RIGHT} ${styles.sticky}`,
      style: { left: contentWidth - columnMetadata.post.size, width: columnMetadata.post.size },
      items: useItems(range.middle_v, range.right, getCachedStyle),
    },
    {
      key: 'top-left',
      className: `${classNames.SECTION} ${classNames.SECTION_TOP} ${classNames.SECTION_LEFT} ${styles.sticky}`,
      style: { top: 0, left: 0 },
      items: useItems(range.top, range.left, getCachedStyle),
    },
    {
      key: 'top-right',
      className: `${classNames.SECTION} ${classNames.SECTION_TOP} ${classNames.SECTION_RIGHT} ${styles.sticky}`,
      style: { top: 0, left: contentWidth - columnMetadata.post.size, width: columnMetadata.post.size },
      items: useItems(range.top, range.right, getCachedStyle),
    },
    {
      key: 'bottom',
      className: `${classNames.SECTION} ${classNames.SECTION_BOTTOM} ${styles.sticky}`,
      style: { top: contentHeight - rowMetadata.post.size, height: rowMetadata.post.size },
      items: useItems(range.bottom, range.middle_h, getCachedStyle),
      // subs: [

      // ]
    },

    {
      key: 'bottom-left',
      className: `${classNames.SECTION} ${classNames.SECTION_BOTTOM} ${classNames.SECTION_LEFT} ${styles.sticky}`,
      style: { top: contentHeight - rowMetadata.post.size, left: 0, height: rowMetadata.post.size },
      items: useItems(range.bottom, range.left, getCachedStyle),
    },
    {
      key: 'bottom-right',
      className: `${classNames.SECTION} ${classNames.SECTION_BOTTOM} ${classNames.SECTION_RIGHT} ${styles.sticky}`,
      style: {
        top: contentHeight - rowMetadata.post.size,
        left: contentWidth - columnMetadata.post.size,
        width: columnMetadata.post.size,
        height: rowMetadata.post.size,
      },
      items: useItems(range.bottom, range.right, getCachedStyle),
    },
  ]
    .filter((e) => e.items.length > 0)
    .map((e) => {
      return {
        ...e,
        // className: e.className + ' ' + e.key,
      };
    });
  return {
    center: {
      key: 'middle',
      className: styles.inner,
      style: { width: columnMetadata.total.size, height: rowMetadata.total.size },
      items: useItems(range.middle_v, range.middle_h, getCachedStyle),
    },
    sections,
  };
}

export default useSections;
