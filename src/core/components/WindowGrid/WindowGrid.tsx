import * as React from 'react';
// import PropTypes from 'prop-types';
import {
  FunctionComponent,
  forwardRef,
  useEffect,
  useMemo,
  SyntheticEvent,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';
import {
  useCachedItem,
  useClassNames,
  useGuidelines,
  useHandle,
  useHelpers,
  useContainerInfo,
  useScrollbarSize,
  useScrollHelper,
  useSections,
  useTheme,
} from '../../hooks';
import { ItemType, ScrollDirection } from '../../hooks/useHelpers';
import { ClassNames } from '../../hooks/useClassNames';
import { ThemeFunction } from '../../hooks/useTheme';
import { closestGridOffset } from '../../hooks/useScrollHelper';

import styles from './WindowGrid.module.scss';

enum FillerType {
  NONE = 'none',
  APPEND = 'append',
  STRETCH = 'stretch',
  SHRINK = 'shrink',
}

type ScrollEvent = SyntheticEvent<HTMLDivElement>;

type ChildProp = {
  rowIndex: number;
  columnIndex: number;
  className: string;
  style: any;
  [key: number]: any;
};

type WindowGridProps = {
  scrollTop?: number;
  scrollLeft?: number;
  width?: number;
  height?: number;
  maxHeight?: number;
  columnCount: number;
  columnWidth: number | Function;
  rowCount: number;
  rowHeight: number | Function;

  fixedTopCount?: number;
  fixedLeftCount?: number;
  fixedRightCount?: number;
  fixedBottomCount?: number;
  overscanCount?: number;

  fillerColumn?: FillerType | string;
  fillerRow?: FillerType | string;
  /** 스크롤되는 뷰포트 너비가 특정값 이하로 떨어지면 fixedColumn 이 무효화된다. */
  minVisibleScrollViewWidth?: number;
  minVisibleScrollViewHeight?: number;

  containerStyle?: any;
  guideline?: boolean;

  classNames?: ClassNames;
  theme?: ThemeFunction;

  scrollSnap?: boolean;
  onScroll?: Function;
  onResize?: Function;

  defaultRowIndex?: number;
  defaultColumnIndex?: number;

  overflow?: boolean;

  children?: (params: ChildProp) => JSX.Element | Element;
};

type ScrollTo = {
  rowIndex?: number;
  columnIndex?: number;
  easing?: string;
  duration?: number;
};

// const IS_SCROLLING_DEBOUNCE_INTERVAL = 150;
const IS_SCROLLING_DEBOUNCE_INTERVAL = 150;

const WindowGrid: FunctionComponent<WindowGridProps> = (props, ref) => {
  const [
    { isScrolling, scrollTop, scrollLeft, verticalScrollDirection, horizontalScrollDirection },
    setScroll,
  ] = useState({
    isScrolling: false,
    scrollTop: 0,
    scrollLeft: 0,
    verticalScrollDirection: ScrollDirection.FORWARD,
    horizontalScrollDirection: ScrollDirection.FORWARD,
  });

  const overflow = props.overflow !== false;

  const onScroll = useHandle(props.onScroll);
  const onResize = useHandle(props.onResize);

  const classNames = useClassNames(props.classNames);

  const theme = useTheme(props.theme, classNames);

  const containerInfo = useContainerInfo({ ...props, theme, classNames });

  const [scrollbarWidth, scrollbarHeight] = useScrollbarSize(overflow);

  const helpers = useHelpers({
    ...props,

    innerWidth: containerInfo.innerWidth,
    innerHeight: containerInfo.innerHeight,
    scrollbarWidth,
    scrollbarHeight,
  });

  // console.log('helpers', helpers)

  const {
    columnMetadata,
    rowMetadata,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
    innerWidth,
    innerHeight,
  } = helpers;

  const { getItemMetadata, getRange } = helpers;

  const { columnCount, columnWidth, rowCount, rowHeight } = props;

  const misc = useRef<any>();
  const scrollHelper = useScrollHelper(
    rowCount,
    columnCount,
    helpers.fixedBottomCount,
    helpers.fixedRightCount,
    getItemMetadata,
    misc,
  );

  const timeoutID = useRef<NodeJS.Timeout>();
  const handleScroll = (event: ScrollEvent) => {
    timeoutID.current && clearTimeout(timeoutID.current);
    const { scrollTop: nextScrollTop, scrollLeft: nextScrollLeft } = event.currentTarget;
    const scroll = {
      isScrolling: true,
      scrollTop: nextScrollTop,
      scrollLeft: nextScrollLeft,
      verticalScrollDirection: scrollTop > nextScrollTop ? ScrollDirection.BACKWARD : ScrollDirection.FORWARD,
      horizontalScrollDirection: scrollLeft > nextScrollLeft ? ScrollDirection.BACKWARD : ScrollDirection.FORWARD,
      rowStartIndex: misc.current.visibleRowStartIndex,
      rowStopIndex: misc.current.visibleRowStopIndex,
      columnStartIndex: misc.current.visibleColumnStartIndex,
      columnStopIndex: misc.current.visibleColumnStopIndex,
      eventTime: new Date().valueOf(),
    };
    setScroll(scroll);
    onScroll(scroll);
    scrollHelper.check(nextScrollLeft, nextScrollTop);
    timeoutID.current = setTimeout(() => {
      let _scroll = { ...scroll, isScrolling: false };
      if (
        misc.current &&
        props.scrollSnap &&
        !scrollHelper.isScrolling() &&
        scrollHelper.scrollTo({
          x: closestGridOffset(ItemType.COLUMN, misc.current),
          y: closestGridOffset(ItemType.ROW, misc.current),
        })
      ) {
        _scroll = { ...scroll, isScrolling: true };
      }
      if (_scroll.isScrolling === false) {
        const [, , visibleRowStartIndex, visibleRowStopIndex] = getRange(
          ItemType.ROW,
          _scroll.scrollTop,
          _scroll.verticalScrollDirection,
        );
        const [, , visibleColumnStartIndex, visibleColumnStopIndex] = getRange(
          ItemType.COLUMN,
          _scroll.scrollLeft,
          _scroll.horizontalScrollDirection,
        );
        _scroll.rowStartIndex = visibleRowStartIndex;
        _scroll.rowStopIndex = visibleRowStopIndex;
        _scroll.columnStartIndex = visibleColumnStartIndex;
        _scroll.columnStopIndex = visibleColumnStopIndex;
      }
      setScroll(_scroll);
      onScroll(_scroll);
    }, IS_SCROLLING_DEBOUNCE_INTERVAL);
  };

  useEffect(() => () => timeoutID.current && clearTimeout(timeoutID.current), []);

  const [overscanRowStartIndex, overscanRowStopIndex, visibleRowStartIndex, visibleRowStopIndex] = getRange(
    ItemType.ROW,
    scrollTop,
    verticalScrollDirection,
  );
  const [overscanColumnStartIndex, overscanColumnStopIndex, visibleColumnStartIndex, visibleColumnStopIndex] = getRange(
    ItemType.COLUMN,
    scrollLeft,
    horizontalScrollDirection,
  );

  const getCachedStyle = useCachedItem({
    getItemMetadata,
    columnCount,
    columnWidth,
    rowCount,
    rowHeight,
    children: props.children,
    classNames,
  });

  const { center, sections } = useSections(
    rowMetadata,
    columnMetadata,
    overscanRowStartIndex,
    overscanRowStopIndex,
    overscanColumnStartIndex,
    overscanColumnStopIndex,
    clientWidth,
    clientHeight,
    getCachedStyle,
    classNames,
  );

  misc.current = {
    clientHeight,
    clientWidth,
    columnCount,
    fixedBottomCount: helpers.fixedBottomCount,
    fixedRightCount: helpers.fixedRightCount,
    getItemMetadata,
    horizontalScrollDirection,
    rowCount,
    scrollHeight,
    scrollLeft,
    scrollTop,
    scrollWidth,
    sections,
    verticalScrollDirection,
    visibleColumnStartIndex,
    visibleColumnStopIndex,
    visibleRowStartIndex,
    visibleRowStopIndex,
  };

  const guidelines = useGuidelines(rowMetadata, columnMetadata, clientWidth, clientHeight, classNames);

  // {"scrollTop":3417,"scrollLeft":0,"clientHeight":283,"scrollHeight":3700}

  // console.log(guidelines);

  // console.log(columnMetadata);

  //eturn null;

  const statusClassName = useMemo(() => {
    return [
      scrollTop === 0 && classNames.SCROLL_TOP,
      scrollLeft === 0 && classNames.SCROLL_LEFT,
      scrollTop >= scrollHeight - clientHeight && classNames.SCROLL_BOTTOM,
      scrollLeft >= scrollWidth - clientWidth && classNames.SCROLL_RIGHT,
      isScrolling ? classNames.IS_SCROLLING : classNames.IS_NOT_SCROLLING,
    ]
      .filter((e) => e)
      .join(' ');
    // return classNames;
  }, [scrollTop, scrollLeft, clientHeight, scrollHeight, clientWidth, scrollWidth, isScrolling, classNames]);

  useEffect(() => {
    const { defaultRowIndex: rowIndex, defaultColumnIndex: columnIndex } = props;
    scrollHelper.scrollToIndex({ rowIndex, columnIndex, duration: 0 });
  }, [props.defaultRowIndex, props.defaultColumnIndex]);

  useImperativeHandle(ref, () => ({ scrollTo: scrollHelper.scrollToIndex }), []);

  const offsetHeight = useMemo(() => {
    return innerHeight + containerInfo.borderTop + containerInfo.borderBottom;
  }, [innerHeight, containerInfo.borderTop, containerInfo.borderBottom]);

  useEffect(() => {
    if (clientWidth > 0) {
      onResize({
        offsetWidth: containerInfo.offsetWidth,
        // offsetHeight: containerInfo.offsetHeight,
        offsetHeight,
        scrollWidth,
        scrollHeight,
        clientWidth,
        clientHeight,
        innerWidth,
        innerHeight,
        scrollbarWidth,
        scrollbarHeight,
        scrollbarY: innerWidth !== clientWidth,
        scrollbarX: innerHeight !== clientHeight,
      });
    }
  }, [
    containerInfo.offsetWidth,
    // containerInfo.offsetHeight,
    offsetHeight,
    scrollWidth,
    scrollHeight,
    clientWidth,
    clientHeight,
    innerWidth,
    innerHeight,
    scrollbarWidth,
    scrollbarHeight,
  ]);

  return (
    <div
      ref={containerInfo.ref}
      className={containerInfo.className}
      style={{ width: containerInfo.offsetWidth, height: offsetHeight }}
    >
      {/* <pre>{JSON.stringify({ scrollTop, scrollLeft, clientHeight, scrollHeight })}</pre> */}
      <div className={statusClassName}>
        <div
          ref={scrollHelper.target}
          style={{ width: innerWidth, height: innerHeight }}
          className={`${styles.root} ${overflow === false ? styles.overflowHidden : ''}`}
          onScroll={handleScroll}
        >
          <div style={{ width: scrollWidth, height: scrollHeight }}>
            {sections.map((section) => (
              <div key={section.key} className={section.className} style={section.style}>
                {section.items}
              </div>
            ))}
            <div className={`${classNames.SECTION} ${classNames.SECTION_CENTER} ${classNames.SECTION_CENTER_V} ${classNames.SECTION_CENTER_H} ${styles.center}`}>{center.items}</div>
          </div>
        </div>
        {props.guideline && (
          <div className={styles.guidelines} style={{ width: clientWidth, height: clientHeight }}>
            {guidelines.map((guideline, i) => {
              return <div key={i} className={guideline.className} style={guideline.style} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default forwardRef(WindowGrid);
