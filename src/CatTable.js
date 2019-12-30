import React, { Component } from "react";
 
class CatTable extends Component {
  render() {
    let to =-1 ;
    return (
      <div >
       <table class="table">
  <thead class="thead-dark">
    <tr>
    {this.props.playerStats.map((stat, i)=>{
          if(stat.name=="TO"){
            to = i;
          }
          return(
          <th key={i} scope="col">{stat.name}</th>
          )})}
    </tr>
  </thead>
  <tbody>
    <tr>
    {this.props.playerStats.map((stat, i)=>{
          return(
          <th key = {i}scope="row">{stat.number}</th>
          )})} 
          </tr>
          <tr>
     {this.props.difference ? this.props.difference.map((diff, i)=> {
       let e;
       let style = {color : "green"}
       let g = <span class="  glyphicon glyphicon-arrow-up" style={{color : "green"}}></span> 
       if(i==to){
        if(diff.toString().charAt(0)!='-'){
          style = {color : "red"}
          g = <span class="  glyphicon glyphicon-arrow-down" style={{color : "red"}}></span> 
        }
       }
       else{
        if(diff.toString().charAt(0)=='-'){
          style = {color : "red"}
          g = <span class="  glyphicon glyphicon-arrow-down" style={{color : "red"}}></span> 
        }
       }
      

       {e= <th key ={i} style={style} scope="row">{diff}{g}</th>}
       return(e)}) : <p></p>}
       </tr>
    
    </tbody>
    </table>       
      </div>
    );
  }
}
 
export default CatTable;