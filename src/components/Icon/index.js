import React, { PureComponent } from 'react';
import { Icon as IconsKit } from 'react-icons-kit';
import { bluetooth } from 'react-icons-kit/fa/bluetooth';

import './styles.css';

export const TYPE_BLUETOOTH = 'bluetooth';

export default class Icon extends PureComponent {
  get typeComponent() {
    const { type } = this.props;

    switch (type) {
      case TYPE_BLUETOOTH:
        return bluetooth;

      default:
        return null;
    }
  }

  render() {
    return (
      <IconsKit
        className="icon"
        icon={this.typeComponent}
        size={30}
      />
    );
  }
}
