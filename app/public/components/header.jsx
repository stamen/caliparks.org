import React, { PropTypes } from 'react';
import Nav from './nav.jsx';
import Slider from 'react-slick';

class Header extends React.Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    viewdata: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.array
    ]).isRequired
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  shouldComponentUpdate() {
    return true;
  }

  componentDidUpdate() { }

  imgError(evt) {
    console.log('EVT: ', evt.target);
  }

  makeSlides() {
    const that = this;
    if (!this.props.viewdata.header) return [];
    if (!this.props.viewdata.header.length) return [];
    return this.props.viewdata.header.map(function(row, idx) {
      return (<div key={idx}><img src={row} onError={that.imgError} /></div>);
    });
  }

  render() {
    const settings = {
      dots: false,
      arrows: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerMode: true,
      centerPadding: '100px'
    };

    return (
      <header>
        <div className='pos-relative'>
          <div id='logo-banner'>
            <img src='assets/svgs/header-banner.svg'/>
          </div>
          <div ref='slider' className='slider-home'>
            <Slider {...settings}>
              {this.makeSlides()}
            </Slider>
          </div>
        </div>
        <Nav/>
      </header>
    );
  }

}

export default Header;