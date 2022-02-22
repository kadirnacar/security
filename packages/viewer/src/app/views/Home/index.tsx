import React, { Component } from 'react';
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout';
import { withSize } from 'react-sizeme';

interface HomeState {}

class Home extends Component<any, HomeState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const layouts = {
      xs: [
        { w: 12, h: 6, x: 0, y: 0, i: 'a', moved: false, static: false },
        { w: 12, h: 6, x: 9, y: 0, i: 'b', moved: false, static: false },
        { w: 12, h: 6, x: 6, y: 0, i: 'c', moved: false, static: false },
      ],
    };
    console.log(this.props);
    return (
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        width={this.props['size'].width}
      >
        <div key="1" data-grid={{ w: 3, h: 2, x: 0, y: Infinity }}>
          1
        </div>
        <div key="2" data-grid={{ w: 3, h: 2, x: 3, y: Infinity }}>
          2
        </div>
        <div key="3" data-grid={{ w: 3, h: 2, x: 0, y: Infinity }}>
          3
        </div>
      </ResponsiveGridLayout>
    );
  }
}

export default withSize({ refreshMode: 'debounce', refreshRate: 60 })(Home);
