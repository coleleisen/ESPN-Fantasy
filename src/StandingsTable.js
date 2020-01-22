import React, { Component } from "react";

class StandingsTable extends Component {

    sortTable = (index)=>{
        console.log("bounjour " + index)
    }
  render() {
    return (
      <div>
    <table class="table">
    <thead class="thead-dark">
    <tr>
        <th scope="col" onClick={()=> this.sortTable(1000)} > TEAM </th>
         
        {this.props.leagueAverage.map((cat, i)=>{
          return(   
          <th key={i} scope="col" onClick={()=> this.sortTable(i)}>{cat.name}</th>
          )})}
    </tr>
  </thead>
  <tbody>
      
      {this.props.teams.map((team, i)=>{
          return(
            <tr>
              <td key={i} scope="row">{team.teamName.substr(1,team.teamName.length)}</td>
                
              {team.catAvg.map((cat, index)=>{
                  return(
                      
                  <td key={index} scope="col" >{cat.number}</td>
                  
                  )
              })}          
              
              </tr>
          )
            })}     
      </tbody>
      </table>
      </div>
    );
  }
}
 
export default StandingsTable;