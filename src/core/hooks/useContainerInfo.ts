import { useMemo, useRef } from 'react';
import { css } from 'emotion';
import useComputedStyle from './useComputedStyle';
// import { ThemeFunction } from './useTheme';
// import styles from '../components/WindowGrid/WindowGrid.module.scss';

type StyleProps = {
  width?: number;
  height?: number;
  containerStyle?: object;
  theme?: string;
  classNames: StringAnyMap;
};

type ContainerInfo = {
  ref: HTMLElementRef;
  className: string;
  offsetWidth: number;
  // offsetHeight: number;
  innerWidth: number;
  innerHeight: number;
  borderTop: number;
  borderLeft: number;
  borderRight: number;
  borderBottom: number;
};

const DEFAULT_HEIGHT = 400;

function useContainerStyle(objectStyles?: StringAnyMap): [string, number, number, number, number] {
  const objectStylesHash = useMemo(() => JSON.stringify(objectStyles), [objectStyles]);
  const className = useMemo(() => {
    return objectStyles && typeof objectStyles === 'object' ? css(objectStyles) : '';
  }, [objectStylesHash]);

  const { borderTopWidth, borderLeftWidth, borderRightWidth, borderBottomWidth } = useComputedStyle(className, [
    'borderTopWidth',
    'borderLeftWidth',
    'borderRightWidth',
    'borderBottomWidth',
  ]);

  return [className, borderTopWidth, borderLeftWidth, borderRightWidth, borderBottomWidth];
}

function useContainerInfo({ width, height, containerStyle, theme, classNames }: StyleProps): ContainerInfo {
  const ref = useRef<HTMLElement>(null);

  const [containerClassName, borderTop, borderLeft, borderRight, borderBottom] = useContainerStyle(containerStyle);

  const { clientWidth } = useComputedStyle(() => ref.current && ref.current.parentElement, [], !width);
  const [offsetWidth, innerWidth] = useMemo(() => {
    const containerWidth = width || clientWidth;
    return [containerWidth, containerWidth - borderLeft - borderRight];
  }, [width, clientWidth, borderLeft, borderRight]);

  const [offsetHeight, innerHeight] = useMemo(() => {
    let offsetHeight = typeof height === 'number' ? height : DEFAULT_HEIGHT;
    let innerHeight = offsetHeight - borderTop - borderBottom;
    return [offsetHeight, innerHeight];
  }, [height, borderTop, borderBottom]);

  const className = useMemo(() => {
    return [classNames.CONTAINER, theme, containerClassName, css({ height: offsetHeight })].filter((e: any) => e).join(' ');
  }, [containerClassName, offsetHeight, classNames.CONTAINER || null]);

  return {
    ref,
    className,
    offsetWidth,
    // offsetHeight,
    innerWidth,
    innerHeight,

    borderTop,
    borderLeft,
    borderRight,
    borderBottom,
  };
}

export default useContainerInfo;
