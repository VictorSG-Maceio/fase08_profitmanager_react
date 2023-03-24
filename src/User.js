import './style.css';
import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import $ from 'jquery';
import CustomInput from './components/CustomInput';
import ManageErrors from './ManageErrors';

export function UserForm() {

  const [lista, setLista] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setPassword_confirmation] = useState('');
  const [guardaDados, setGuardaDados] = useState({});

  function enviaForm(evento) {
    evento.preventDefault();
    console.log("dados sendo enviados...");

    $.ajax({
      url: "https://fase08profitmanager-production.up.railway.app/api/v2/auth",
      
      contentType: 'application/json',
      dataType: 'json',
      accept: 'application/json',

      type: 'post',
      data: JSON.stringify(
        {
          name: nome,
          email: email,
          password: password,
          password_confirmation: password_confirmation
        }
      ),

      success: function(resposta) {
        console.log("Sucesso!");
        console.log(resposta);

        var obj = guardaDados;
        $.each(resposta.data, function(index, value) {
          obj[index] = value;
        });
        setGuardaDados(obj);

        setTimeout(function(){
          var novaLista = lista;
          novaLista.push(guardaDados);

          PubSub.publish('atualiza-lista-usuarios', novaLista);
          alert("Cadastro realizado com sucesso!");
          setNome('');
          setEmail('');
          setPassword('');
          setPassword_confirmation('');
          setGuardaDados({});
          setLista(novaLista);
        }, 10);
      },

      complete: function(resposta) {
        console.log("Complete!!");
        console.log(resposta.getAllResponseHeaders());
        var obj = guardaDados;
        obj.token = resposta.getResponseHeader('access-token');
        obj.client = resposta.getResponseHeader('client');
        obj.uid = resposta.getResponseHeader('uid');
        setGuardaDados(obj);
      },
      
      error: function(resposta) {
        if (resposta.status === 422) {
          new ManageErrors().publishErrors(resposta.responseJSON);
        }
      }
    });
  }
  
  return (
    <div>						
      <h1 class="h2">Cadastro de Usuários</h1>						
      <form method="post" onSubmit={enviaForm}>
        <CustomInput type="text" id="name" label="Nome" 
            name="name" placeholder="Nome"
            value={nome} onChange={e => setNome(e.target.value)}/>

        <CustomInput type="email" id="email" label="E-mail" 
            name="email" placeholder="E-mail" 
            value={email} onChange={e => setEmail(e.target.value)}/>
        <CustomInput  type="password" id="password" label="Senha" 
            name="password" placeholder="Senha"
            value={password} onChange={e => setPassword(e.target.value)}/>
        <CustomInput type="password" id="password_confirmation" label="Confirmação" 
            name="password_confirmation" placeholder="Confirme"
            value={password_confirmation} 
            onChange={e => setPassword_confirmation(e.target.value)} />
        <button type="submit" class="btn btn-primary">Inscrever-se</button>
      </form>						
    </div>
  );
}

export function UserTable() {
  const [lista, setLista] = useState([]);

  useEffect(() => {
    PubSub.subscribe('atualiza-lista-usuarios', (topico, novaLista) => {
      console.log("novaLista!!!!!!");
      setLista(novaLista);
    });

    PubSub.subscribe('erro-validacao', (topico, erro) => {
      alert(erro);
    });
  });

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
            lista.map((user) => {
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
