import PubSub from 'pubsub-js';

export default class ManageErrors {
  publishErrors(errors){
    for (var i=0;i < errors.errors.full_messages.lenght;i++){
      var erro = errors.errors.full_messages[i];
      console.log(erro);
      PubSub.publish("erro-validacao", erro);
    }
  }
}