import { useMemo, useRef } from 'react';
import anime from 'animejs';
import { ItemType, ScrollDirection } from './useHelpers';

type State = {
  isScrolling: boolean;
  position: {
    scrollTop: number;
    scrollLeft: number;
  } | null;
};

type ScrollTo = {
  x: number;
  y: number;
  easing?: string;
  duration?: number;
};

function useScroll() {
  const target = useRef<HTMLElementRef>(null);
  const state = useRef<State>({ isScrolling: false, position: null });
  const animejs = useRef<anime.AnimeInstance>();

  const [scrollTo, isScrolling, check] = useMemo(() => {
    const begin = (anim: anime.AnimeInstance) => {
      state.current.isScrolling = true;
      state.current.position = null;
      animejs.current = anim;
    };

    const update = (anim: anime.AnimeInstance) => {
      // @ts-ignore
      anim.animations.reduce((accum, { property, currentValue }) => ({ ...accum, [property]: currentValue }), {});
    };

    const complete = () => {
      state.current.isScrolling = false;
      state.current.position = null;
      animejs.current = undefined;
    };

    const scrollTo = ({ x, y, easing = 'easeInCubic', duration = 200 }: ScrollTo) => {
      if (!target.current || (target.current.scrollTop === y && target.current.scrollLeft === x)) {
        return false;
      }

      if (animejs.current) {
        animejs.current.pause();
        complete();
      }

      anime({
        targets: target.current,
        scrollLeft: x,
        scrollTop: y,
        easing,
        duration,
        begin,
        update,
        complete,
      });

      return true;
    };

    const isScrolling = () => state.current.isScrolling;

    const check = (x: number, y: number) => {
      if (state.current.position && animejs.current) {
        const { scrollTop, scrollLeft } = state.current.position;
        if (Math.abs(scrollTop - y) > 1 || Math.abs(scrollLeft - x) > 1) {
          animejs.current.pause();
          complete();
        }
      }
    };

    return [scrollTo, isScrolling, check];
  }, []);

  return {
    target,
    scrollTo,
    check,
    isScrolling,
  };
}

function closestGridOffset(itemType: ItemType, misc: any) {
  const { sections, getItemMetadata } = misc;

  let scrollDirection = itemType === ItemType.ROW ? misc.verticalScrollDirection : misc.horizontalScrollDirection;

  let clientSize = itemType === ItemType.ROW ? misc.clientHeight : misc.clientWidth;

  let scrollOffset = itemType === ItemType.ROW ? misc.scrollTop : misc.scrollLeft;
  let scrollSize = itemType === ItemType.ROW ? misc.scrollHeight : misc.scrollWidth;

  let itemCount = itemType === ItemType.ROW ? misc.rowCount : misc.columnCount;

  let postNm = itemType === ItemType.ROW ? 'bottom' : 'right';
  let typeNm = itemType === ItemType.ROW ? 'height' : 'width';

  const postFixedCount = (itemType === ItemType.ROW ? misc.fixedBottomCount : misc.fixedRightCount) || 0;

  const startIndex = itemType === ItemType.ROW ? misc.visibleRowStartIndex : misc.visibleColumnStartIndex;

  const stopIndex = itemType === ItemType.ROW ? misc.visibleRowStopIndex : misc.visibleColumnStopIndex;

  const startOffset = getItemMetadata(itemType, startIndex).localOffset;

  if (startOffset < scrollOffset) {
    if (scrollDirection === ScrollDirection.FORWARD && stopIndex === itemCount - postFixedCount - 1) {
      let efs = clientSize;
      const bottom = sections.filter((e: any) => e.key === postNm)[0];
      if (bottom) {
        efs = efs - bottom.style[typeNm];
      }
      const { size, offset } = getItemMetadata(itemType, stopIndex);

      if (offset + size / 2 < scrollOffset + efs) {
        return scrollSize - clientSize;
      }
    }

    const svc = getItemMetadata(itemType, startIndex);
    // console.log(svc);
    if (startOffset + svc.size / 2 < scrollOffset) {
      // console.log('case 1');
      return startOffset + svc.size;
    } else {
      // console.log('case 2');
      return startOffset;
    }

    // console.log(ranges.top, scrollTop);
  }
  return scrollOffset;
}

export default useScroll;

export { closestGridOffset };
