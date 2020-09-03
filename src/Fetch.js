import React, { Component } from "react";
import axios from 'axios';
import Navigatior from "./Navigator";

class Fetch extends Component {
    state = {
        catAverage : [],
        teams : [],
        league : "DGFBL",
        confirmedLeague : "",
        status : true,
        first : true,
        collapse : false
      }

      handleChange = event => {
        this.setState({ league: event.target.value });
      }
      collapser = event => {
        this.setState({ collapse: false, first : true });
      }
    
      handleSubmit = event => {
        event.preventDefault();
    
        const l = {
          league: this.state.league

        };
    
        
        axios.post(`https://obscure-fjord-24529.herokuapp.com/fetch`, l)
          .then(res => {
            console.log(res);
            console.log(res.data);
            if(res.data.status=="fail"){
              this.setState({status : false, catAverage : [], teams : [], league : "", confirmedLeague : "", first : false});
            }
            else{
              this.setState({ catAverage: res.data.catAvg, teams : res.data.teams, confirmedLeague : res.data.leagueName, status : true, first : false, collapse : true});
            }
            
          })
          .catch((error)=>{
            console.log(error)
        })
      }

  render() {
    return (
      <div >
        
         
          {this.state.collapse ? (<h2>
            <button type="button" onClick={this.collapser} className="btn-lg" style={{backgroundColor : "rgb(24, 26, 27)",borderColor : "rgb(24, 26, 27)", color : "white"}}>
              Change League
            </button>

          </h2>) :
          (
            <form onSubmit={this.handleSubmit} >
          
          <div class = "form-group">
           <h2>
           <span class="label label-danger" style={{backgroundColor : "#cc0000"}} > Enter League Name Below</span>
         
          <span class="glyphicon glyphicon-menu-down"></span>
       </h2>
      
       <h2 style={{color : "red"}}>
       <span class="glyphicon glyphicon-chevron-down"></span>
       </h2>
         <input type="text" name="name" value={this.state.league}class="form-control" style={{margin : "10px"}}  onChange={this.handleChange} />
       
         <button type="submit" class="btn btn-outline-danger">
         <span class="glyphicon glyphicon-search"></span>
         </button>
         </div>      
        </form>
          )
          }   
        {!this.state.first ? <h2>{this.state.confirmedLeague}</h2> : <h2></h2>}
        {!this.state.first ? this.state.status ? <Navigatior teams= {this.state.teams} leagueAverage = {this.state.catAverage}></Navigatior> :
          (<h2>No fantasy league with that name in our database. Add your league to our database by clicking the scrape button.</h2>) : (<h2>Enter fantasy league name</h2>)
        }
      </div>
      
    );
  }
}
 
export default Fetch;