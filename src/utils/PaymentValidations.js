import Validators from './Validators';
import moment from 'moment/min/moment-with-locales'
moment.locale('pt-BR');

const PaymentValidations = {

    firstStep: (form) => {
        let { name, cpf, nascimento, celular, email} = form;
        let cpfValid;
        let dtNacimentoValid;
        let originalName;
        let dataAtual = moment()
        // Realiza o trim nos campos
        if (name) {
            name = name.trim();
            originalName = name;
            name = name.split(' ');
        }
        if (email) {
            email = email.trim();
        }
        if (cpf) {
            cpf = cpf.trim();
            cpfValid = Validators.isValidCPF(cpf)
        }
        if (nascimento) {
            nascimento = nascimento.trim();
            dataAtual = moment(dataAtual);
        }
        if (celular) {
            celular = celular.trim();
        }
        
        if (name && name.length > 1 && name[0].length > 1 && cpf && cpf.length == 14 && cpfValid && nascimento && nascimento.length == 10 && celular && celular.length == 15 && email) {
            form = {name:originalName, cpf, nascimento, celular, email}
            return {error: false, form};
        } else if(!name || name.length <= 1) {
            return { error:true, message: "Nome Completo é um campo obrigátório.", campo: "Name"}
        } else if (name[0].length <= 1) {
            return { error:true, message: "Digite um nome válido para continuar.", campo: "Name"}
        } else if (!cpf || cpf.length < 14) {
            return { error:true, message: "Campo CPF é um campo obrigatório. Digite um CPF válido.", campo: "Cpf"}
        } else if (!cpfValid) {
            return { error:true, message: "O CPF inserido não é válido. Tente novamente", campo: "Cpf"}
        } else if (!nascimento || nascimento.length < 10) {
            return { error:true, message: "Campo Data de Nascimento é um campo obrigatório. Digite uma data de nascimento válida.", campo: "Nascimento"}
        } else if (!celular || celular.length < 15) {
            return { error:true, message: "Campo Celular é um campo obrigatório. Digite um Celular válido.", campo: "Celular"}
        } else if (!email || email.length < 5) {
            return { error:true, message: "Campo e-mail é um campo obrigatório.", campo: "Email"}
        }            
    },

    secondStep: (form) => {
        let {name, cpf, nascimento, celular, email, uf, city, district, street, zipcode, number, complement, } = form;

        if (uf) {
            uf = uf.trim();
        }
        if (city) {
            city = city.trim();
        }
        if (district) {
            district = district.trim();
        }
        if (street) {
            street = street.trim();
        }
        if (zipcode) {
            zipcode = zipcode.trim();
        }
        if (number) {
            number = number.trim();
        }
        if (complement) {
            complement = complement.trim();
        }

        if ( zipcode && zipcode.length == 9 && uf && uf.length == 2 && city && city.length > 3 && street && street.length > 4 && district && district.length > 3 && number ) {
            form = { name, cpf, nascimento, celular, uf, city, district, street, zipcode, number, complement, email }
            return {error: false, form};
        }else if(!zipcode || zipcode.length < 9){
            return { error: true, message: "CEP é um campo obrigatório. Digite um CEP válido.", campo: "Cep" }
        }else if(!uf || uf.length < 2){
            return { error: true, message: "UF é um campo obrigatório. Digite uma UF válida.", campo: "Uf" }
        }else if(!city || city.length < 3){
            return { error: true, message: "Cidade é um campo obrigatório. Digite uma Cidade válida.", campo: "City" }
        }else if(!street || street.length < 4){
            return { error: true, message: "Endereço é um campo obrigatório. Digite um Endereço válido.", campo: "Street" }
        }else if(!district || district.length < 3){
            return { error: true, message: "Bairro é um campo obrigatório. Digite um Bairro válido.", campo: "Bairro" }
        }else if(!number){
            return { error: true, message: "Número é um campo obrigatório. Digite um Número válido.", campo: "Numero" }
        }

    },

    cardMethod: (form) => {
        let { name, cpf, nascimento, celular, uf, city, district, street, zipcode, number, nuCartao, nameCartao, dtCartao, cvcCartao, email, method, brand, parcelas } = form;
        let cartaoValido;

        if (nuCartao) {
            cartaoValido = Validators.numberValidationCard(nuCartao);
            nuCartao = nuCartao.trim();
        }
        if (nameCartao) {
            nameCartao = nameCartao.trim();
        }
        if (dtCartao) {
            dtCartao = dtCartao.trim();
        }
        if (cvcCartao) {
            cvcCartao = cvcCartao.trim();
        }

        if (nuCartao && cartaoValido.isValid && nameCartao && dtCartao && dtCartao.length == 5 && cvcCartao && cvcCartao.length == 3) {
            form = {name, cpf, nascimento, celular, uf, city, district, street, zipcode, number, nuCartao, nameCartao, dtCartao, cvcCartao, email, method, brand, parcelas}
            return {error: false, form};
        } else if(!nuCartao) {
            return { error: true, message: "Número do cartão é um campo obrigatório", campo: "NuCartao" }
        }else if(!cartaoValido.isValid) {
            return { error: true, message: "Digite um Número de cartão válido.", campo: "NuCartao" }
        }else if(!nameCartao) {
            return { error: true, message: "Nome no cartão é um campo obrigatório", campo: "NameCartao" }
        }else if(!dtCartao || dtCartao.length < 5) {
            return { error: true, message: "Digite uma data de vencimento válida.", campo: "DtCartao" }
        }else if(!cvcCartao || cvcCartao.length < 3 ) {
            return { error: true, message: "CVC do cartão é um campo obrigatório.", campo: "CvcCartao" }
        }
    },

    QueroParticiparForm: (form) => {
        let { nomeRestaurante, name, uf, city, celular, email, instagram, observacao,  } = form;

        let emailValido;

        if (nomeRestaurante) {
            nomeRestaurante = nomeRestaurante.trim();
        }
        if (name) {
            name = name.trim();
        }
        if (uf) {
            uf = uf.trim();
        }
        if (city) {
            city = city.trim();
        }
        if (celular) {
            celular = celular.trim();
        }
        if (email) {
            email = email.trim();
            emailValido = Validators.validEmail(email)
        }
        if (instagram) {
            instagram = instagram.trim();
        }
        if (observacao) {
            observacao = observacao.trim();
        }

        if (nomeRestaurante && nomeRestaurante.length > 2 && name && name.length > 2 && uf && uf.length == 2 && city && city.length > 2 && celular && celular.length == 15 && email && emailValido) {
            form = {nomeRestaurante, name, uf, city, celular, email, instagram, observacao}
            return {error: false, form};
        } else if(!nomeRestaurante || nomeRestaurante.length <= 2) {
            return { error: true, message: "Nome do Restaurante é um campo obrigatório.", campo: "NomeRestaurante" }
        }else if(!name || name.length <= 2) {
            return { error: true, message: "Nome para contato é um campo obrigatório.", campo: "Name" }
        }else if(!uf || uf.length < 2) {
            return { error: true, message: "UF é um campo obrigatório", campo: "Uf" }
        }else if(!city || city.length <= 2){
            return { error: true, message: "Cidade é um campo obrigatório. Digite uma Cidade válida.", campo: "City" }
        }else if (!celular || celular.length < 15) {
            return { error:true, message: "Celular é um campo obrigatório. Digite um Celular válido.", campo: "Celular"}
        }else if (!email || !emailValido) {
            return { error: true, message: "E-mail é um campo obrigatório. Digite um E-mail válido.", campo: "Email"}
        }
    },

}

export default PaymentValidations;