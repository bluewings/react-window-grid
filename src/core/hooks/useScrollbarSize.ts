import useComputedStyle from './useComputedStyle';

function useScrollbarSize(overflow: boolean): [number, number] {
  const { offsetWidth, offsetHeight, clientWidth, clientHeight } = useComputedStyle(
    { width: 200, height: 200, overflow: 'scroll' },
    [],
  );
  if (overflow === false) {
    return [0, 0];
  }
  return [offsetWidth - clientWidth, offsetHeight - clientHeight];
}

export default useScrollbarSize;
