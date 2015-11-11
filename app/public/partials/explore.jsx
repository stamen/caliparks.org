import React, {PropTypes} from 'react';
import PureComponent from 'react-pure-render/component';
import Dropdown from 'react-select';
// import GoogleMap from 'google-map-react';
import {GoogleMap, Marker} from 'react-google-maps';
import CustomTileLayer from '../components/customTileLayer';
import Navigator from '../components/navigator';

export default class Explore extends PureComponent {
  static propTypes = {
    height: PropTypes.number,
    handleOnChange: PropTypes.func,
    mostSharedParks: PropTypes.shape({
      parks: PropTypes.array,
      interval: PropTypes.string,
      isFetching: PropTypes.bool
    }).isRequired,
    handleMarkerClick: PropTypes.func
  };

  state = {
    selectedMarkerIdx: 0
  }

  componentDidMount() {}

  componentDidUpdate() {}

  onMarkerClick(item) {
    if (typeof this.props.handleMarkerClick === 'function') {
      this.props.handleMarkerClick(item.superunit_id);
    }
  }

  onNavigatorChange(dir) {
    const length = this.props.mostSharedParks.parks.length - 1;
    const idx = this.state.selectedMarkerIdx;
    if (dir === 'prev') {
      if (idx > 0) this.setState({selectedMarkerIdx: this.state.selectedMarkerIdx - 1});
    } else {
      if (idx < length) this.setState({selectedMarkerIdx: this.state.selectedMarkerIdx + 1});
    }
  }

  getHeight() {
    return this.props.height || 700;
  }

  logChange(val) {
    if (typeof this.props.handleOnChange === 'function') {
      this.props.handleOnChange(val);
    }
  }

  getMarkerIcon(idx) {
    // circle icon path generator:
    // http://complexdan.com/svg-circleellipse-to-path-converter/
    const icon = {
      scale: 1,
      fillOpacity: 1,
      strokeOpacity: 1
    };

    if (idx === this.state.selectedMarkerIdx) {
      icon.path = 'M-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0';
      icon.fillColor = '#ffffff';
      icon.strokeColor = '#358292';
      icon.strokeWeight = 4;
    } else {
      icon.path = 'M-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0';
      icon.fillColor = '#358292';
      icon.strokeColor = '#358292';
      icon.strokeWeight = 0;
    }
    return icon;
  }

  render() {
    /*
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'season-now', label: 'This season' },
    { value: 'season-last', label: 'Last season' },
     */
    const options = [
      { value: 'week-now', label: 'This week' },
      { value: 'week-last', label: 'Last week' },
      { value: 'month-now', label: 'This month' },
      { value: 'month-last', label: 'Last month' },
      { value: 'year-now', label: 'This year' },
      { value: 'year-last', label: 'Last year' }
    ];

    return (
      <div id='explore' name='explore' className='row theme-white' style={{height: this.getHeight() + 'px'}}>
        <div className='col-four'>
          <div className='center-align-container'>
            <h4 className='uppercase'>Explore</h4>
            <p className='description'>Photos pour out of our parks daily. See what’s happening and where.</p>

            <div className='dropdown-filter'>
              <p className='label uppercase'>Showing top 10 parks</p>
              <Dropdown
                className='dropdown'
                name='park-top-ten-picker'
                value={this.props.mostSharedParks.interval || 'week-now'}
                options={options}
                clearable={false}
                onChange={this.logChange.bind(this)} />
            </div>
          </div>
        </div>
        <div className='col-eight'>
          {this.props.mostSharedParks.isFetching &&
            <div className='loading-data'><h3>Loading</h3></div>
          }
          <Navigator
            items={this.props.mostSharedParks.parks}
            selectedItem={this.state.selectedMarkerIdx}
            nameKey={'unit_name'}
            onChange={this.onNavigatorChange.bind(this)} />

          <GoogleMap containerProps={{
            style: {
              height: '100%',
            },
          }}
            defaultZoom={6}
            options={{
              streetViewControl: false,
              scrollwheel: false,
              mapTypeControl: false
            }}
            defaultCenter={{lat: 37.735969, lng: -121.640625}}
          >
            <CustomTileLayer tileUrl='http://{s}.map.parks.stamen.com/{z}/{x}/{y}{r}.png' {...this.props} />
            {this.props.mostSharedParks.parks.map((marker, index) => {
              const coords = marker.centroid.coordinates;
              return (<Marker
                key={marker.superunit_id}
                onClick={this.onMarkerClick.bind(this, marker)}
                icon={this.getMarkerIcon(index)}
                position={{lat:coords[1], lng:coords[0]}} />
              );
            })}
          </GoogleMap>
        </div>
      </div>
    );
  }
}