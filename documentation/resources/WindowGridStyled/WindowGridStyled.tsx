import * as React from 'react';
import { WindowGrid } from '../../../src/core';

const theme = (classNames) => {
  return {
    [classNames.CELL]: {
      display: 'flex',
      fontSize: 12.5,
      // padding: 8,
      borderRight: '1px solid #dadcde',
      borderBottom: '1px solid #dadcde',
      // border: '1px solid blue',
      // borderTopColor: 'red',
      // borderLeftColor: 'red',
      alignItems: 'center',
      justifyContent: 'center',
    },
    [`${classNames.ROW_EVEN}${classNames.COL_EVEN},${classNames.ROW_ODD}${classNames.COL_ODD}`]: {
      background: '#f5f6f7',
    },
    [classNames.IS_SCROLLING]: {
      [classNames.CELL1]: {
        background: 'lightyellow',
      },
    },
    // [`${classNames.SECTION_TOP},${classNames.SECTION_BOTTOM}`]: {
    //   [classNames.CELL]: {
    //     background: 'rgba(255,0,0,0.2)',
    //   },
    // },
    // [`${classNames.SECTION_LEFT},${classNames.SECTION_RIGHT}`]: {
    //   [classNames.CELL]: {
    //     background: 'rgba(0,255,0,0.2)',
    //   },
    // },
  };
};

function WindowGridStyled(props) {
  return <WindowGrid {...props} theme={theme} />;
}

export default WindowGridStyled;
