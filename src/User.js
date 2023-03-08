import './style.css';
import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import $ from 'jquery';
import CustomInput from './components/CustomInput';
import ManageErrors from './ManageErrors';

export class UserForm  extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lista : [ ],
      name : '',
      email : '',
      password : '',
      password_confirmation : '',
      guardaDados : {}
    }
    this.enviaForm = this.enviaForm.bind(this);
    this.setName = this.setName.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.setPasswordConfirmation = this.setPasswordConfirmation.bind(this);

    this.guardaDados = {};
  }

  enviaForm(evento) {
    evento.preventDefault();
    console.log("dados sendo enviados...");

    $.ajax({
      url: "https://profitmanager.onrender.com/api/v2/auth",
      
      contentType: 'application/json',
      dataType: 'json',
      accept: 'application/json',

      type: 'post',
      data: JSON.stringify(
        {
          name: this.state.name,
          email: this.state.email,
          password: this.state.password,
          password_confirmation: this.state.password_confirmation
        }
      ),

      success: function(resposta) {
        console.log("Sucesso!");
        console.log(resposta);

        $.each(resposta.data, function(index, value) {
          this.guardaDados[index] = value;
        }.bind(this));

        setTimeout(function(){
          var  novaLista = this.state.lista;
          novaLista.push(this.guardaDados);
          //this.setState({lista: novaLista});

          PubSub.publish('atualiza-lista-usuarios', novaLista);

          this.guardaDados = {};
        }.bind(this), 10);
      },
      complete: function(resposta){
        console.log("Complete!!");
        console.log(resposta.getAllResponseHeaders());
        this.guardaDados.token = resposta.getResponseHeader('access-token');
        this.guardaDados.client = resposta.getResponseHeader('client');
        this.guardaDados.uid = resposta.getResponseHeader('uid');
      }.bind(this),
      error: function(resposta){
        if (resposta.status === 422) {
          new ManageErrors().publishErrors(resposta.responseJSON);
        }
      }
    });
  }

  setName(evento){
    this.setState( { name : evento.target.value } );
  }
  setEmail(evento){
    this.setState( { email : evento.target.value } );
  }
  setPassword(evento){
    this.setState( { password : evento.target.value } );
  }
  setPasswordConfirmation(evento){
    this.setState( { password_confirmation : evento.target.value } );
  }

  render () {
    return (
      <div>						
        <h1 class="h2">Cadastro de Usuários</h1>						
        <form method="post" onSubmit={this.enviaForm}>
          <CustomInput type="text" id="name" label="Nome" 
              name="name" placeholder="Nome"
              value={this.state.name} onChange={this.setName}/>
          <CustomInput type="email" id="email" label="E-mail" 
              name="email" placeholder="E-mail" 
              value={this.state.email} onChange={this.setEmail}/>
          <CustomInput  type="password" id="password" label="Senha" 
              name="password" placeholder="Senha"
              value={this.state.password} onChange={this.setPassword}/>
          <CustomInput type="password" id="password_confirmation" label="Confirmação" 
              name="password_confirmation" placeholder="Confirme"
              value={this.state.password_confirmation} 
              onChange={this.setPasswordConfirmation} />
          <button type="submit" class="btn btn-primary">Inscrever-se</button>
        </form>						
      </div>
    );
  }
}
export class UserTable  extends Component {
  constructor(props) {
    super(props);
    this.state = {lista : []}
  }

  componentDidMount(){
    PubSub.subscribe('atualiza-lista-usuarios', function(topico, novaLista){
      this.setState({lista:novaLista});
    }.bind(this))

    PubSub.subscribe('erro-validacao', function(topico, erro){
      alert(erro);
    })
  }
  render(){
    return(
      <div class="table-responsive">
        <h2>Usuários</h2>
        <table class="table table-striped table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>E-mail</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.lista.map(function(user){
                return(
                  <tr>
                    <td>{user.id}</td>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                  </tr>
                );
              })
            }							
          </tbody>
        </table>
      </div>
    );
  }
}