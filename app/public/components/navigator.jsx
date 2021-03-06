import React, {PropTypes} from 'react';
import PureComponent from 'react-pure-render/component';
import {FormattedMessage} from 'react-intl';
import { Link } from 'react-router';

export default class Navigator extends PureComponent {

  static propTypes = {
    items: PropTypes.array,
    nameKey: PropTypes.string,
    idKey: PropTypes.string,
    selectedItem: PropTypes.number,
    onChange: PropTypes.func,
    hideTop: PropTypes.bool
  };

  static defaultProps = {
    items: [],
    nameKey: 'name',
    idKey: 'id',
    selectedItem: 0,
    onChange: () => {},
    hideTop: false
  };

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
    const {items, hideTop, selectedItem} = this.props;
    const showNavi = items.length ? true : false;
    const item = (items.length && items[selectedItem]) ? items[selectedItem] : {};
    const showTop = (hideTop || !item || (item.total < 0 || isNaN(item.total))) ? false : true;

    return (
      <div className='navigator'>
        {showNavi &&
          <div className='inner'>
            {showTop &&
              <div className='top'>
                <div className='col arrow'>
                <button className='btn' disabled={this.getBtnState('prev')} onClick={this.onClickHandler.bind(this, 'prev')}>
                  <svg className={'icon prev-arrow small' }>
                    <use xlinkHref='main.svg#prev-arrow' />
                  </svg>
                </button>
                </div>
                <div className='col rank-count'>
                  <span className='rank'>{selectedItem + 1}</span>
                  <span className='count'>
                    <FormattedMessage
                      id='navigator.countss'
                      defaultMessage={`{count, plural,
                        =0 {no photos}
                        =1 {one photo}
                        other {# photos}}
                      `}
                      values={{count: item.total}}
                    />
                  </span>
                </div>
                <div className='col arrow'>
                <button className='btn' disabled={this.getBtnState('next')} onClick={this.onClickHandler.bind(this, 'next')}>
                  <svg className={'icon next-arrow small' }>
                    <use xlinkHref='main.svg#next-arrow' />
                  </svg>
                </button>
                </div>
              </div>
            }
            <p className='name'>
              <Link to={`/park/${item[this.props.idKey]}`}>
                <span>
                  {item[this.props.nameKey]}
                </span>
                <span>
                  <svg className='icon right-triangle'>
                      <use xlinkHref='/main.svg#icon-right-triangle' />
                  </svg>
                </span>
              </Link>
            </p>
          </div>
        }
      </div>
    );
  }
}
