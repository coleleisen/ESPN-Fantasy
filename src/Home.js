import React, { Component } from "react";

import Scrape from "./Scrape";
import Fetch from "./Fetch";
import Trade from "./Trade";

class Home extends Component {
  render() {
    return (
      <div class="text-center">
        <h1>ESPN Fantasy Sports</h1>
      <div class="container-fluid">
          <div class="row">
          <div class="col-lg-2" >
              ads
          </div>
          <div class="col-lg-8" >        
            <Fetch></Fetch>
          </div>
          <div class="col-lg-2" >
              ads
          </div>
     </div>       
    </div>
    </div>
    );
  }
}
 
export default Home;