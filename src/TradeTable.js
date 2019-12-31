import React, { Component } from "react";
import CatTable from "./CatTable";
 
class TradeTable extends Component {

  

  componentDidUpdate(prevProps) {
    if (prevProps.team.teamName !== this.props.team.teamName) {
     
      let len = this.props.playerName.length
        this.props.removePlayer(0 , len);      
    }
  }

  render() {
   
    return (
      <div>
          <h3 style={{paddingBottom : 0}}>{this.props.team.teamName}</h3>
        <div class="dropdown" style={{margin : "10px"}}>
    <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown" style={{backgroundColor:"#cc0000", background : "#cc0000"}}>Trade player
    <span class="caret"></span></button>
    <ul class="dropdown-menu"  style={{backgroundColor:"red", background : "rgb(24,26,27"}}>
    {this.props.team.players ? this.props.team.players.map((player, i)=>{
        let e;
        {player.injured ? e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",borderColor : "rgb(24, 26, 27)", color : "white"}} disabled>{player.name}</button></li>
         : e =<li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",borderColor : "rgb(24, 26, 27)", color : "white"}} onClick={()=> this.props.insertPlayer(player.name)}>{player.name}</button></li>} 
        return e;
}) : <h2>error no players array</h2>}   
    </ul>
    </div>
    <div class="container" style ={{ margin : 0, padding : 0}}>
 
  
      {this.props.playerName.map((player, i)=>{
          return(
              <div key ={i} class="container" style ={{margin : 0, padding :0 , height : "120px"}}>
             <div class ="row" >
               <div class="col-lg-2">          
               <img style = {{height : "120px", width : "100%", float : "left"}} src={this.props.team.players[player.index].image} alt="Cinque Terre" class="img-responsive"></img>
               </div>
              <div class="col-lg-10">
              <div class="row" style ={{ height : "38px", margin : 0, padding : 0}}>       
              <div class="col-lg-11">
              <h3 style={{width : "95%", height: "50%", margin: 0, padding : 0 }}>{this.props.team.players[player.index].name}</h3>
              </div>
              <div class="col-lg-1">
              <button id="xButton" className="btn btn-link" onClick={() => this.props.removePlayer(i, 1)}>
              <span class="glyphicon glyphicon-remove" style={{color : "red", height : "100%", margin : 0, float : "right"}}></span>
              </button>
              </div>   
              </div>  
              <CatTable playerStats = {this.props.team.players[player.index].categories}></CatTable> 
              </div> 
              </div>
        </div>
          )
      }) }
    
      </div>
      <div class="container" style ={{margin : 0, padding :0 , height : "120px"}}>  
      <div class="row" >
        <div class="col-lg-2" >
        <img style = {{height : "120px", width : "100%", float : "left"}} src={this.props.team.logo} alt="Cinque Terre" class="img-responsive"></img>
        </div>
        <div class="col-lg-10">
        <div class="row" style ={{ height : "38px", margin : 0, padding : 0}}>       
              <div class="col-lg-11">
        <h3 style={{margin :0, padding : 0, width: "95%", height : "50%"}}>Team Stats</h3>
        </div>
        <div class="col-lg-1"></div>
        </div>

            <CatTable playerStats = {this.props.catAvg} difference = {this.props.difference}></CatTable>
        </div>
      </div>
      </div>
       
      </div>
    );
  }
}
 
export default TradeTable;