import React, { Component } from "react";

class StandingsTable extends Component {

    constructor(props){
        super(props)
        this.state={
            selected : 1000,
            teams : [],
            og : []
        }
    }
    componentDidMount(){
        let oger = JSON.parse(JSON.stringify(this.props.teams));
        this.setState({teams : this.props.teams, og : oger});
    }
    sortTable = (index)=>{
        let table = this.state.teams;
        if(index==1000){
            table = JSON.parse(JSON.stringify(this.state.og));
        }
        else{
            if(this.state.selected===index){
                table.reverse();
            }
            else{
                table.sort((a,b) =>  b.catAvg[index].number  - a.catAvg[index].number );
            }
            
        }
        this.setState({teams : table, selected : index})
    }
  render() {
    return (
      <div>
    <table class="table">
    <thead class="thead-dark">
    <tr>
        <th scope="col" key={1000} style={{textAlign : "center"}} data-column={1000} onClick={()=> this.sortTable(1000)} >TEAM <i class="glyphicon glyphicon-sort"></i></th>
         
        {this.props.leagueAverage.map((cat, i)=>{
            let e;
            {this.state.selected!==i ? e=<th key={i} scope="col" style={{textAlign : "center"}} data-column={i} onClick={()=> this.sortTable(i)}>{cat.name} <i class="glyphicon glyphicon-sort"></i></th> :  
            e = <th key={i} scope="col" style={{textAlign : "center", backgroundColor: "red"}} data-column={i} onClick={()=> this.sortTable(i)}>{cat.name} <i class="glyphicon glyphicon-sort"></i></th> }

          return e; 
          })}
    </tr>
  </thead>
  <tbody>
      
      {this.state.teams.map((team, i)=>{
          return(
            <tr key={i}>
              <td key={10+i} data-column={1000} scope="row"><p>{team.teamName.substr(2,team.teamName.length)}</p></td>
                
              {team.catAvg.map((cat, index)=>{
                  let e;
                  {this.state.selected!==index ? e= <td key={i*100+index} data-column={index} scope="col" ><p>{cat.number}</p></td> :  
                    e= <td key={i*100+index} data-column={index} style={{backgroundColor : "red"}}scope="col" ><p>{cat.number}</p></td>}
                return e; 
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