import React, {PropTypes} from 'react';
import PureComponent from 'react-pure-render/component';
import {FormattedNumber} from 'react-intl';
import { Link } from 'react-router';

export default class Navigator extends PureComponent {

  static propTypes = {
    items: PropTypes.array,
    nameKey: PropTypes.string,
    selectedItem: PropTypes.number,
    onChange: PropTypes.func
  };

  static defaultProps = {
    items: [],
    nameKey: 'name',
    selectedItem: 0,
    onChange: () => {}
  }

  state = {
    index: 0
  };

  componentDidMount() {}

  componentDidUpdate() {}

  onClickHandler(dir) {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(dir);
    }
  }

  getBtnState(btnName) {
    if (btnName === 'prev' && this.props.selectedItem === 0) return true;
    if (btnName === 'next' && this.props.selectedItem === (this.props.items.length - 1)) return true;
    return false;
  }

  render() {
    const showNavi = this.props.items.length ? true : false;
    const item = this.props.items.length ? this.props.items[this.props.selectedItem] : {};
    return (
      <div className='navigator'>
        {showNavi &&
          <div className='inner'>
            <div className='top'>
              <div className='col arrow'>
              <button className='btn' disabled={this.getBtnState('prev')} onClick={this.onClickHandler.bind(this, 'prev')}>
                <svg className={'icon prev-arrow small' }>
                  <use xlinkHref='main.svg#prev-arrow' />
                </svg>
              </button>
              </div>
              <div className='col rank-count'>
                <span className='rank'>{this.props.selectedItem + 1}</span>
                <span className='count'><FormattedNumber value={item.total} /> photos</span>
              </div>
              <div className='col arrow'>
              <button className='btn' disabled={this.getBtnState('next')} onClick={this.onClickHandler.bind(this, 'next')}>
                <svg className={'icon next-arrow small' }>
                  <use xlinkHref='main.svg#next-arrow' />
                </svg>
              </button>
              </div>
            </div>
            <p className='name'><Link to={`/park/${item.superunit_id}`}>{item[this.props.nameKey]}</Link></p>
          </div>
        }
      </div>
    );
  }
}