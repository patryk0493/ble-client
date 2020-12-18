import React, { PureComponent } from 'react';

import './styles.css';

export const TYPE_BUTTON = 'button';
export const TYPE_RESET = 'reset';
export const TYPE_SUBMIT = 'submit';

export default class Button extends PureComponent {
  render() {
    const { children, ...props } = this.props;

    return (
      <button
        {...props}
        className="button"
      >
        {children}
      </button>
    );
  }
}
