import React, { Component } from "react";
import TradeTable from "./TradeTable";

class Trade extends Component {
 
 constructor(props){
   super(props)
   this.state={
    teamNameA : "",
    teamNameB : "",
    triggerA : false,
    triggerB : false,
    indexA : null,
    indexB : null,
    catAvgA : [],
    catAvgB : [],
    OgCatAvgA : [],
    OgCatAvgB : [],
    playersA : [],
    playersB : [],
    differenceA: [],
    differenceB : []
   }

   this.insertPlayerA = this.insertPlayerA.bind(this);
   this.insertPlayerB = this.insertPlayerB.bind(this);
   this.removePlayerB = this.removePlayerB.bind(this);
   this.removePlayerA = this.removePlayerA.bind(this);
   
 }

 insertPlayerB = (name)=> {
  let play = [...this.state.playersB];
  console.log("bonjour")
  let catterB = JSON.parse(JSON.stringify(this.props.teams[this.state.indexB].catAvg));
  let catterA = this.state.OgCatAvgA;
  if(this.state.triggerA){
    catterA = JSON.parse(JSON.stringify(this.props.teams[this.state.indexA].catAvg));
  }
  let diffA=null;
  let diffB=null;
  var value = this.props.teams[this.state.indexB].players.map((player, i) => {
      if(player.name==name){
        let flag =0;
        this.state.playersB.map((playerr, i)=>{
          if(playerr.name==name){ //if player is already in trade
              flag =1;
          }
        })
        if(flag==0){
          play.push({ name: name, index :i });         
          if(this.state.playersA.length === play.length && play.length > 0 && this.state.playersA.length > 0 && catterA && catterB){     
            diffA=new Array(catterA.length).fill(0);
            diffB=new Array(catterB.length).fill(0);
            //if its an even quantity trade
            for(var j =0 ; j < this.state.playersA.length ; j++){
              for(var i = 0;i < catterA.length ;i++){
                if(catterA[i].name!=="FG%" && catterA[i].name !=="FT%" && catterB[i].name !=="FG%" && catterB[i]){        
                let xa = this.state.indexA;
                let xb = this.state.indexB;
                let bindex = this.state.playersA[j].index
                let numA= this.props.teams[xa].players[bindex].categories[i];
                let numB = this.props.teams[xb].players[play[j].index].categories[i];
                let b = numB.number
                let a = numA.number
                console.log({nameA : numA.name, numbA : a})
                console.log({nameB : numB.name , numB : b})
                let differ = b - a;
                differ = differ.toFixed(3);
                differ = parseFloat(differ);           
                differ = differ * 10;
                diffA[i] += differ /10;
                diffA[i] = diffA[i].toFixed(1);
                diffA[i] = parseFloat(diffA[i])
                let n1 = catterA[i].number;
                console.log(n1)
                n1 = n1 *10;
                n1 += differ;
                n1 = n1/10
                console.log(n1)
                catterA[i].number = n1;
                let n2 = catterB[i].number;
                differ = a -b;
                differ = differ.toFixed(3);
                differ = parseFloat(differ);           
                differ = differ * 10;
                diffB[i] += differ/10;
                diffB[i] = diffB[i].toFixed(1);
                diffB[i] = parseFloat(diffB[i])
                n2 = n2 *10;
                n2 += differ;
                n2 = n2/10
                catterB[i].number = n2;                          
                }
                else{ //is %
                  let n3 = catterA[i-2].number / catterA[i-1].number
                  n3 = n3.toFixed(3);
                  n3 = parseFloat(n3);
                  diffA[i] += n3 - catterA[i].number;
                  diffA[i] = diffA[i].toFixed(3);
                  diffA[i] = parseFloat(diffA[i])
                  catterA[i].number = n3;
                  let n4 = catterB[i-2].number / catterB[i-1].number
                  n4 = n4.toFixed(3);
                  n4 = parseFloat(n4);
                  diffB[i] += n4 - catterB[i].number;
                  diffB[i] = diffB[i].toFixed(3);
                  diffB[i] = parseFloat(diffB[i])
                  catterB[i].number = n4;
                }
              }
            }
            
          }
          return i; 
        } 
      }
  });    
  this.setState({playersB : play, catAvgA : catterA, catAvgB : catterB , differenceA : diffA, differenceB : diffB});
} 
removePlayerB = (i, n) =>{
let play = [...this.state.playersB];
play.splice(i , n);
let catterB = this.state.OgCatAvgB;
let catterA = this.state.OgCatAvgA;
let differ = null;
console.log(catterB[7]);
this.setState({playersB : play, catAvgA : catterA, catAvgB : catterB, differenceA : differ, differenceB : differ})

} 

insertPlayerA = (name)=>{
  let play = [...this.state.playersA];
  let catterB=this.state.OgCatAvgB;
  if(this.state.triggerB){
     catterB = JSON.parse(JSON.stringify(this.props.teams[this.state.indexB].catAvg));
  }
  let catterA = JSON.parse(JSON.stringify(this.props.teams[this.state.indexA].catAvg));
  let diffA = null;
  let diffB = null;
 
  var value = this.props.teams[this.state.indexA].players.map((player, i) => {
      if(player.name==name){
        let flag =0;
        this.state.playersA.map((playerr, i)=>{
          if(playerr.name==name){
              flag =1;
          }
        })
        if(flag==0){
          play.push({ name: name, index :i });
          if(this.state.playersB.length === play.length && play.length > 0 && this.state.playersB.length > 0 && catterA && catterB){
            diffA=new Array(catterA.length).fill(0);
            diffB=new Array(catterB.length).fill(0);
            //if its an even quantity trade
            //subtract playersA from catterA and add playersB to catterA 
            //keep array to store difference in each cat
            //subtract playersB from catterB and add playersA to catterB
            for(var j =0 ; j < this.state.playersB.length ; j++){
              for(var i = 0;i < catterB.length ;i++){
                if(catterA[i].name!=="FG%" && catterA[i].name !=="FT%" && catterB[i].name !=="FG%" && catterB[i]){

                
                let xa = this.state.indexA;
                let xb = this.state.indexB;
                let bindex = this.state.playersB[j].index
                let numB= this.props.teams[xb].players[bindex].categories[i];
                let numA = this.props.teams[xa].players[play[j].index].categories[i];
                let b = numB.number
                let a = numA.number
                console.log({nameA : numA.name, numbA : a})
                console.log({nameB : numB.name , numB : b})
                let differ = b - a;
                differ = differ.toFixed(3);
                differ = parseFloat(differ);           
                differ = differ * 10;
                diffA[i] += differ /10;
                diffA[i] = diffA[i].toFixed(1);
                diffA[i] = parseFloat(diffA[i])
                let n1 = catterA[i].number;
                console.log(n1)
                n1 = n1 *10;
                n1 += differ;
                n1 = n1/10
                console.log(n1)
                catterA[i].number = n1;
                let n2 = catterB[i].number;
                differ = a -b;
                differ = differ.toFixed(3);
                differ = parseFloat(differ);           
                differ = differ * 10;
                diffB[i] += differ/10;
                diffB[i] = diffB[i].toFixed(1);
                diffB[i] = parseFloat(diffB[i])
                n2 = n2 *10;
                n2 += differ;
                n2 = n2/10
                catterB[i].number = n2;
             
                }
                else{ //is %
                  let n3 = catterA[i-2].number / catterA[i-1].number
                  n3 = n3.toFixed(3);
                  n3 = parseFloat(n3);
                  diffA[i] += n3 - catterA[i].number;
                  diffA[i] = diffA[i].toFixed(3);
                  diffA[i] = parseFloat(diffA[i])
                  catterA[i].number = n3;
                  let n4 = catterB[i-2].number / catterB[i-1].number
                  n4 = n4.toFixed(3);
                  n4 = parseFloat(n4);
                  diffB[i] += n4 - catterB[i].number;
                  diffB[i] = diffB[i].toFixed(3);
                  diffB[i] = parseFloat(diffB[i])
                  catterB[i].number = n4;
                }
              }
            }
            
          }
          return i; 
        } 
      }
  });    
  this.setState({playersA : play, catAvgA : catterA, catAvgB : catterB , differenceA : diffA, differenceB : diffB});
} 
removePlayerA=(i, n)=> {
let play = [...this.state.playersA];
play.splice(i , n);
let catterB = this.state.OgCatAvgB;
let catterA = this.state.OgCatAvgA;
let differ = null;
this.setState({playersA : play, catAvgA : catterA, catAvgB : catterB, differenceA : differ, differenceB : differ})

} 

 tradeTeamA = event => {
   let s =  event.currentTarget.textContent

   let n = parseInt(s.charAt(0));
   let n2 = parseInt(s.charAt(1));
   if(n2!="NaN"){
     let s2 = s.substr(0, 2)
     let n3 = parseInt(s2);
     n=n3-1;
   } 
   else if(n!="NaN"){
    n-= 1;
   }
   else{
     n=0;
   }



   let catterA = this.props.teams[n].catAvg;
   let differ = null;
    this.setState({ teamNameA: s, triggerA : true, indexA : n, catAvgA : catterA, OgCatAvgA : catterA, differenceA : differ, differenceB : differ});
  }
  tradeTeamB = event => {
    let s =  event.currentTarget.textContent
    let n = parseInt(s.charAt(0));
    let n2 = parseInt(s.charAt(1));
   if(n2!="NaN"){
     let s2 = s.substr(0, 2)
     let n3 = parseInt(s2);
     n=n3-1;
   } 
   else
    if(n!="NaN"){
      n-= 1;
     }
     else{
      n=0;
    }

    let catterB = this.props.teams[n].catAvg;
    let differ = null;
    this.setState({ teamNameB: s , triggerB : true, indexB : n, catAvgB : catterB, OgCatAvgB : catterB, differenceA : differ, differenceB : differ});
  }

  render() {
    return (
      <div>
  <h2>Trade Analyzer</h2>
  <p>Choose two teams and select players to trade.
  </p>
        <h2 style={{display : "inline"}}>
        <span class="glyphicon glyphicon-arrow-right" style={{color : "red"}}></span> 
        <span class="glyphicon glyphicon-arrow-left" style={{color : "green"}}></span> 
        </h2>
    <div className="float-left">
      <h2>Team A</h2>
    <div class="dropdown" style={{margin : "10px"}}>
    <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown" style={{backgroundColor:"red", background : "red"}}>Select Team A
    <span class="caret"></span></button>
    <ul class="dropdown-menu" style={{backgroundColor:"red", background : "rgb(24,26,27"}}>
    {this.props.teams ? this.props.teams.map((team, i)=>{
      let e;
      {this.state.teamNameB != team.teamName ?  e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",border : "none", color : "white"}} onClick={this.tradeTeamA}>{team.teamName}</button></li> : 
    e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",border : "none", color : "white", background : "rgb(24,26,27"}} disabled>{team.teamName}</button></li> }
   return e;
    
}) : <h2>error no teams array</h2>}   
    </ul>
    </div>
    </div> 
    <div className="float-right">
      <h2>Team B</h2>
    <div class="dropdown" style={{margin : "10px"}}>
    <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown" style={{backgroundColor:"#cc0000", background : "#cc0000"}}>Select Team B
    <span class="caret"></span></button>
    <ul class="dropdown-menu" style={{backgroundColor:"#cc0000", background : "rgb(24,26,27", borderColor : "rgb(24,26,27"}}>
    {this.props.teams ? this.props.teams.map((team, i)=>{
      let e;
      {this.state.teamNameA != team.teamName ?  e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",border : "none", color : "white"}} onClick={this.tradeTeamB}>{team.teamName}</button></li> : 
      e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",border : "none", color : "white"}} disabled>{team.teamName}</button></li>}
      
    return e;
    
}) : <h2>error no teams array</h2>}   
    </ul>
    </div>
    </div> 
{this.state.triggerA && this.state.catAvgA ? <div><TradeTable catAvg = {this.state.catAvgA} team = {this.props.teams[this.state.indexA]} playerName = {this.state.playersA} insertPlayer ={this.insertPlayerA} removePlayer={  this.removePlayerA } difference = {this.state.differenceA}> </TradeTable> </div>  : <h3>Team A</h3>}
<br></br>
{this.state.triggerB && this.state.catAvgB?  <div><TradeTable catAvg = {this.state.catAvgB} team = {this.props.teams[this.state.indexB]} playerName = {this.state.playersB} insertPlayer ={ this.insertPlayerB } removePlayer={  this.removePlayerB } difference = {this.state.differenceB}></TradeTable> </div> : <h3>Team B</h3>}
    </div>
    );
  }
}
 
export default Trade;