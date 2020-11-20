const Validators = {
    numberValidationCard: (cardNumber) => {
        let valid = require('card-validator');
        let numberValidation = valid.number(cardNumber);

        return numberValidation;
    },
    numberFormatted: (numero) => {
        numero = Number(numero);
        numero = numero.toFixed(1).split('.');
        numero[0] = numero[0].split(/(?=(?:...)*$)/).join('.');
        return numero.join(',');
    },
    validEmail: (email) => {
        if( email == "" || email.length < 5 || email.indexOf('@')==-1 || email.indexOf('.')==-1 ){
           return false;
        }else{
            return true;
        }
    },
    isValidCPF: (cpf) => {
        cpf = cpf.replace(/[^\d]+/g, '');

        if (cpf == '')
            return false;

        if (cpf.length != 11 ||
            cpf == "00000000000" ||
            cpf == "11111111111" ||
            cpf == "22222222222" ||
            cpf == "33333333333" ||
            cpf == "44444444444" ||
            cpf == "55555555555" ||
            cpf == "66666666666" ||
            cpf == "77777777777" ||
            cpf == "88888888888" ||
            cpf == "99999999999")
            return false;

        // Valida 1o digito	
        let add = 0;
        for (let i = 0; i < 9; i++)
            add += parseInt(cpf.charAt(i)) * (10 - i);

        let rev = 11 - (add % 11);
        if (rev == 10 || rev == 11)
            rev = 0;

        if (rev != parseInt(cpf.charAt(9)))
            return false;

        // Valida 2o digito	
        add = 0;
        for (i = 0; i < 10; i++)
            add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11)
            rev = 0;
        if (rev != parseInt(cpf.charAt(10)))
            return false;

        return true;
    }
}

export default Validators;