import React from 'react';
import JinReact360Viewer from './JinReact360Viewer'; // Import Props from your component file

function App(): React.ReactElement {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12 mb-4 card p-0">
          <div className="v360-header text-light bg-dark">
            <span className="v360-header-title">36 Images - Autoplay (1 loop) - Reverse Spin</span>
            <span className="v360-header-description"></span>
          </div>
          <JinReact360Viewer
            amount={36}
            imagePath="https://fastly-production.24c.in/webin/360"
            fileName="output_{index}.jpeg"
            spinReverse={true}
            autoplay={true}
            buttonClass="dark"
          />
        </div>
      </div>
    </div>
  );
}

export default App;