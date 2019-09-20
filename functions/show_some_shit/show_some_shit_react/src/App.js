import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  const [shit_to_show, setShitToShow] = useState();

  const person_id = getParameterByName("person_id");
  const token = getParameterByName("token");
  const data_location = "show_some_shit";

  if( shit_to_show===undefined ){
    const url = `https://node.andbrant.com/database&data_location=${data_location}`;

    fetch(url, {
      method:"GET",
      headers: {
        "Authorization": `Basic ${btoa(`${person_id}:${token}`)}`
      },
      credentials: "same-origin"
    })
    .then(d => d.json())
    .then((data) => {
      setShitToShow(data);
    });
  }

  return (
    <div className="App">
      {getShitToShow(shit_to_show)}
    </div>
  );
}

function getShitToShow(shit_to_show){

  if(shit_to_show ===undefined|| shit_to_show===null){
    return null;
  }

  const to_return = [];

  for( let k in shit_to_show ){
    to_return.push(<div className="PieceOfShit"><PieceOfShit {...shit_to_show[k]}></PieceOfShit></div>);
  }

  return (to_return);
}

function PieceOfShit(props){

  const to_return = [];

  if( props.name!==undefined ){
    to_return.push(<div>
      {props.name}
    </div>);
  }

  if( props.description!==undefined ){
    to_return.push(<div>
      {props.description}
    </div>);
  }

  if( props.link!==undefined ){
    to_return.push(<a href={props.link}>link</a>);
  }

  //props.data

  return (<div>
    {to_return}
  </div>);
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export default App;
