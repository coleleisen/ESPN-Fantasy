import React, { Component } from "react";
import CatTable from "./CatTable";
 
class Matchup extends Component {

  constructor(props){
    super(props)
    this.state={
     teamNameAa : "",
     teamNameBb : "",
     triggerAa : false,
     triggerBb : false,
     indexAa : null,
     indexBb : null,
     catAvgAa : [],
     catAvgBb : [],
     differenceAa: [],
     differenceBb :[],
     countA : 0,
     countB : 0
    }
    
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
 
 
 
    let catterA = JSON.parse(JSON.stringify(this.props.teams[n].catAvg));
    //setup catter array
    for(var i = 0; i < catterA.length ; i++){
     let ner = catterA[i].name;
      if(ner === "MIN" || ner === "FTA" || ner ==="FTM" || ner ==="FGA" || ner ==="FGM"){      
        catterA.splice(i, 1);
        i--;
      }
    }
    let differA = null;
    let differB = null;
    let counterA = 0;
    let counterB = 0;
    if(this.state.triggerB===true){
      differA = new Array(catterA.length);
      differB = new Array(catterA.length);
       for(var i = 0 ; i < catterA.length ; i++){
        if(this.state.catAvgB[i].number >= catterA[i].number){
          if(this.state.catAvgB[i].number === catterA[i].number){
            differA[i] = 0;
            differB[i] = 0;
          }
          else{
            differB[i] = this.state.catAvgB[i].number - catterA[i].number;
            differB[i] = differB[i].toFixed(2);
            differA[i] =  catterA[i].number - this.state.catAvgB[i].number;
            differA[i] = differA[i].toFixed(2);
            if(catterA[i].name==="TO"){
              counterA++;
            }
            else{
              counterB++;
            }  
          }
      }
      else{
        differB[i] = this.state.catAvgB[i].number - catterA[i].number;
        differB[i] = differB[i].toFixed(2);
        differA[i] = catterA[i].number - this.state.catAvgB[i].number;
        differA[i] = differA[i].toFixed(2);
        if(catterA[i].name==="TO"){
          counterB++;
        }
        else{
          counterA++;
        }      
      }
    }
  }
     this.setState({ teamNameAa: s, triggerAa : true, indexAa : n, catAvgAa : catterA, differenceAa : differA, differenceBb : differB, countA : counterA, countB : counterB});
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
 
     let catterB = JSON.parse(JSON.stringify(this.props.teams[n].catAvg));
      //setup catter array
    for(var i = 0; i < catterB.length ; i++){
      let ner = catterB[i].name;
      if(ner === "MIN" || ner === "FTA" || ner ==="FTM" || ner ==="FGA" || ner ==="FGM"){      
        catterB.splice(i, 1);
        i--;
      }
      
    }
     let differA = null;
     let differB = null;
     let counterA = 0;
     let counterB = 0;
     if(this.state.triggerA===true){
       differA = new Array(catterB.length);
       differB = new Array(catterB.length);
        for(var i = 0 ; i < this.state.catAvgA.length ; i++){
          if(this.state.catAvgA[i].number >= catterB[i].number){
              if(this.state.catAvgA[i].number === catterB[i].number){
                differA[i] = 0;
                differB[i] = 0;
              }
              else{
                differA[i] = this.state.catAvgA[i].number - catterB[i].number;
                differA[i] = differA[i].toFixed(2);
                differB[i] =  catterB[i].number - this.state.catAvgA[i].number;
                differB[i] = differB[i].toFixed(2);
                if(catterB[i].name==="TO"){
                  counterB++;
                }
                else{
                  counterA++;
                }  
              }
          }
          else{
            differA[i] = this.state.catAvgA[i].number - catterB[i].number;
            differA[i] = differA[i].toFixed(2);
            differB[i] = catterB[i].number - this.state.catAvgA[i].number;
            differB[i] = differB[i].toFixed(2);
            if(catterB[i].name==="TO"){
              counterA++;
            }
            else{
              counterB++;
            }      
          }
        }
     }
     
     this.setState({ teamNameBb: s , triggerBb : true, indexBb : n, catAvgBb : catterB, differenceAa : differA, differenceBb : differB, countA : counterA, countB : counterB});
   }
  render() {
    return (
      <div>
        <h2>Matchup Analysis</h2>   
        <p>Choose two teams to see head to head matchup
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
            {this.state.teamNameBb != team.teamName ?  e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",border : "none", color : "white"}} onClick={this.tradeTeamA}>{team.teamName}</button></li> : 
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
         {this.state.teamNameAa != team.teamName ?  e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",border : "none", color : "white"}} onClick={this.tradeTeamB}>{team.teamName}</button></li> : 
         e = <li key={i}><button className="btn" style={{backgroundColor : "rgb(24, 26, 27)",border : "none", color : "white"}} disabled>{team.teamName}</button></li>}
      
         return e;
    
      }) : <h2>error no teams array</h2>}   
      </ul>
      </div>
      </div> 
      
    {this.state.triggerAa && this.state.catAvgAa ? <div> <h3>{this.state.teamNameAa}</h3> <div><CatTable  playerStats = {this.state.catAvgAa} difference = {this.state.differenceAa}> </CatTable> </div></div>  : <h3>Team A</h3>}
      <br></br>
      {this.state.triggerBb && this.state.catAvgBb? <div> <h3>{this.state.teamNameBb}</h3> <div><CatTable  playerStats = {this.state.catAvgBb} difference = {this.state.differenceBb}> </CatTable> </div></div>  : <h3>Team B</h3>}
      <br></br>
   
    {this.state.triggerAa && this.state.triggerBb ?  this.state.countA > this.state.countB ? <div><h3>Winner : {this.state.teamNameAa.substr(1)}</h3> <h3>{this.state.countA} - {this.state.countB}</h3></div> : <div><h3>Winner : {this.state.teamNameBb.substr(1)}</h3> <h3>{this.state.countB} - {this.state.countA}</h3></div> : <h3></h3>}
      </div>
    );
  }
}
 
export default Matchup;