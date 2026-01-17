import { MutableRefObject } from 'react';

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare global {
  interface StringTMap<T> {
    [key: string]: T;
  }
  interface NumberTMap<T> {
    [key: number]: T;
  }

  interface StringAnyMap extends StringTMap<any> {}
  interface NumberAnyMap extends NumberTMap<any> {}

  interface StringFunctionMap extends StringTMap<Function> {}
  interface NumberFunctionMap extends NumberTMap<Function> {}

  type HTMLElementRef = MutableRefObject<HTMLElement | null>;
}

export {};
