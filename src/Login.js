import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import CustomInput from './components/CustomInput';
import ManageErrors from './ManageErrors';
import PubSub from 'pubsub-js';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [guardaDados, setGuardaDados] = useState('');

    function enviaForm(evento) {
        evento.preventDefault();
        console.log('Dados de login sendo enviados!');

        $.ajax({
            url: "https://fase08profitmanager-production.up.railway.app/api/v2/auth/sign_in",
      
            contentType: 'application/json',
            dataType: 'json',
            accept: 'application/json',

            type: 'post',
            data: JSON.stringify({
                email: email,
                password: password
            }),

            success: (resposta) => {
                console.log('Sucesso!');
                console.log(resposta);
                alert('Login efetuado com sucesso!');
            },

            complete: (resposta) => {
                console.log('Complete');
                console.log(resposta.getAllResponseHeaders());

                var obj = guardaDados;
                obj.token = resposta.getResponseHeader('access-token');
                obj.client = resposta.getResponseHeader('client');
                obj.uid = resposta.getResponseHeader('uid');
                setGuardaDados(obj);

                PubSub.publish('access-token', obj.token);
                PubSub.publish('client', obj.client);
                PubSub.publish('uid', obj.uid);
            },

            error: (resposta) => {
                if (resposta.status === 422) {
                    new ManageErrors().publishErrorsValidation(resposta.responseJSON);
                }
            }
        });
    }

    return(
        <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">		
            <br />
            <div>						
                <h1 className="h2">Login</h1>						
                <form onSubmit={enviaForm} method="post">
                    <div className="form-group">
                        <CustomInput type="email" id="email" label="E-mail" 
                            name="email" placeholder="E-mail" 
                            value={email} onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <CustomInput  type="password" id="password" label="Senha" 
                            name="password" placeholder="Senha"
                            value={password} onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <button type="submit" className="btn btn-primary">Entrar</button>
                </form>						
            </div>
            
        </main>
    );
}

export default Login;