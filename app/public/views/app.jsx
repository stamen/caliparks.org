import React, {PropTypes} from 'react';
import PureComponent from 'react-pure-render/component';
import {connect} from 'react-redux';
import {throttle, isEmpty} from 'lodash';

import HomeIndex from '../partials/index';
import Explore from '../partials/explore';
import Discover from '../partials/discover';
import Footer from '../partials/footer';
import StickyNav from '../partials/sticky-nav';
import * as actions from '../actions';

import {SectionsContainer, Section} from 'react-fullpage';

const mapStateToProps = (state) => state;

export class App extends PureComponent {
  static propTypes = {
    mostSharedParks: PropTypes.object,
    fetchMostSharedParks: PropTypes.func.isRequired,
    featuredParks: PropTypes.object,
    fetchFeaturedParks: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    viewData: PropTypes.object.isRequired,
    history: PropTypes.object,
    setWindowSize: PropTypes.func,
    windowSize: PropTypes.object
  };

  componentWillMount() {
    this.currentIndex = 0;
  }

  componentDidMount() {
    this.handleResizeThrottled = throttle(this.handleResize, 250).bind(this);
    window.addEventListener('resize', this.handleResizeThrottled);

    // Cause a re-render to resize components with
    // window size
    this.handleResize();

    if (isEmpty(this.props.featuredParks)) {
      console.log('Fetching featured parks');
      this.props.fetchFeaturedParks();
    }

    if (isEmpty(this.props.mostSharedParks.parks)
                && !this.props.mostSharedParks.isFetching) {
      console.log('Fetching featured parks');
      this.props.fetchMostSharedParks();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResizeThrottled);
  }

  onLeaveHandler(prevIndex, currentIndex) {
    this.currentIndex = currentIndex;
  }

  onAfterLoadHandler(currentIndex) {
    console.log('Loaded: %s', currentIndex);
  }

  getWindowDimensions() {
    // Need to make sure we have a window due to
    // server rendering...
    if (typeof window === 'undefined') return {width: 0, height: 0};

    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  handleResize() {
    this.props.setWindowSize(this.getWindowDimensions());
  }

  handleExploreChange(interval) {
    const {mostSharedParks, fetchMostSharedParks} = this.props;
    if (mostSharedParks.isFetching) return;
    fetchMostSharedParks(interval.value, mostSharedParks.bbox);
  }

  handleExploreBoundsChange(bounds) {
    const {mostSharedParks, fetchMostSharedParks} = this.props;
    if (mostSharedParks.isFetching) return;
    fetchMostSharedParks(mostSharedParks.interval, [bounds[1], bounds[0], bounds[3], bounds[2]]);
  }

  render() {
    const options = {
      activeClass:          'active', // the class that is appended to the sections links
      anchors:              ['index', 'explore', 'discover', 'footer'], // the anchors for each sections
      arrowNavigation:      true, // use arrow keys
      className:            'SectionContainer', // the class name for the section container
      delay:                700, // the scroll animation speed
      navigation:           false, // use dots navigatio
      scrollBar:            false, // use the browser default scrollbar
      sectionClassName:     'section', // the section class name
      sectionPaddingTop:    '0', // the section top padding
      sectionPaddingBottom: '0', // the section bottom padding
      verticalAlign:        false, // align the content of each section vertical
      autoFooterHeight:     true
    };

    const isSticky = this.currentIndex >= 1 ? true : false;
    const stickyKlass = (this.currentIndex === 2 || this.currentIndex === 3) ? ' white' : '';

    return (
      <div className='container'>
        {isSticky &&
          <div className={'sticky-container'}>
            <StickyNav className={stickyKlass}/>
          </div>
        }
        <SectionsContainer
          onLeave={this.onLeaveHandler.bind(this)}
          afterLoad={this.onAfterLoadHandler.bind(this)} {...options}>
          <Section>
            <HomeIndex
              height={this.props.windowSize.height || 0}
              width={this.props.windowSize.width || 0}
              images={this.props.viewData.header}
              autoplay={true}
              autoplaySpeed={8000}
              featuredParks={this.props.featuredParks}/>
          </Section>
          <Section>
            <Explore
              mostShared={this.props.mostSharedParks}
              width={this.props.windowSize.width || 0}
              height={this.props.windowSize.height || 0}
              handleOnChange={this.handleExploreChange.bind(this)}
              boundsChange={this.handleExploreBoundsChange.bind(this)} />
          </Section>
          <Section>
            <Discover
              width={this.props.windowSize.width || 0}
              height={this.props.windowSize.height || 0} />
          </Section>
          <Section>
            <Footer lang={this.props.lang} />
          </Section>
        </SectionsContainer>
      </div>
    );
  }
}

export const AppContainer = connect(mapStateToProps, actions)(App);
