import React, { Component } from 'react'; 
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { Icon } from 'react-native-elements'
import Accordion from 'react-native-collapsible/Accordion';

import Pageheader from '../components/Pageheader';
import def_styles from '../assets/styles/theme.styles'
import Theme from '../constants/Theme';
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;
const { width, height } = Dimensions.get('window');
const SECTIONS = [
    {
        cardID: 0,
        title: 'EXISTE LIMITE DE UTILIZAÇÃO DE VOUCHERS?',
        content: 'Não. Uma vez como associado, você pode utilizar todos os vouchers disponíveis em qualquer cidade que o Clube Rota Gourmet esteja presente. Desde que você se atente ao dia e ao intervalo de utilização de cada restaurante, você pode usar quantos quiser. ',
    },
    {
        cardID: 1,
        title: 'TODOS OS VOUCHERS SÃO BONIFICANDO UM PRATO INTEIRAMENTE POR CONTA DO CLUBE?',
        content: 'Sim, com exceção dos vouchers delivery. Mas se lembre. Como princípio básico você deve estar com pelo menos um acompanhante e consumir no mínimo dois pratos, certo? Então, consumindo dois pratos de mesmo valor, um deles o Clube banca pra você. Se forem dois pratos de valores diferentes, o clube bancará o de menor custo. Do mesmo modo, se consumirem três ou mais pratos e algum tenha preço diferente, bancamos o de menor valor.',
    },
    {
        cardID: 2,
        title: 'COMO FUNCIONAM OS VOUCHERS DE DELIVERY?',
        content: 'No caso de voucher delivery funciona da seguinte maneira. Se pedir apenas um prato, você terá 30% de desconto no valor do prato. Se pedir dois ou mais, seu desconto aumenta para 50% sobre um dos pratos. Lembrando que se forem pratos diferentes, o desconto é sobre o de menor custo.',
    },
    {
        cardID: 3,
        title: 'POSSO PEDIR O DELIVERY DO CLUBE ROTA GOURMET POR APLICATIVOS DE ENTREGA?',
        content: 'Opa! Não. O pedido do delivery deve ser feito diretamente no restaurante, da maneira que eles disponibilizarem o contato. Lembre-se de informar que é do Clube Rota Gourmet para que levem o código de autenticação para seu aplicativo validar o voucher.',
    },
    {
        cardID: 4,
        title: 'TENHO OU POSSO USAR TODOS OS MEUS VOUCHERS EM UM MESMO RESTAURANTE?',
        content: 'Não. Cada restaurante determina nas regras de utilização a periodicidade em que você pode repetir a utilização.',
    },
    {
        cardID: 5,
        title: 'POSSO USAR MEU VOUCHER TODOS OS DIAS NO MESMO RESTAURANTE?',
        content: 'Hmmm. Isso vai depender de qual restaurante. Cada restaurante estabelece a periodicidade de liberação do seu voucher. Logo quando iniciar sua associação todos os vouchers estarão liberados, porém a cada vez que você utilizar o voucher em um restaurante, para que você possa voltar a utilizar de novo no mesmo restaurante, vai depender do intervalo que ele informou nas regras de utilização. O mínimo é de seis em seis meses e o máximo são todos os dias.',
    },
    {
        cardID: 6,
        title: 'EU E MEU ACOMPANHANTE PODEMOS CADA UM LEVAR UM VOUCHER DO MESMO RESTAURANTE E USARMOS AO MESMO TEMPO?',
        content: 'Bem, desse modo não. Obrigatoriamente você tem que levar pelo menos um acompanhante e portanto consumirem no mínimo dois pratos. Um por nossa conta. Mas sugerimos que você vá hoje com seu acompanhante use o seu voucher, e amanhã volte para ele usar o voucher dele.',
    },
    {
        cardID: 7,
        title: 'POSSO COMPRAR SÓ UM VOUCHER?',
        content: 'O Clube oferece uma associação que lhe dá direito a um guia completo, não separadamente. Vale muito a pena fazer o tour gastronômico, selecionamos os melhores restaurantes para você. Quanto ao valor, nem se fala, é inacreditavelmente bom.',
    },
    {
        cardID: 8,
        title: 'OS PRATOS SÃO SELECIONADOS?',
        content: 'O cardápio é livre, você vai escolher os pratos que deseja experimentar. Não queremos restringir sua experiência gastronômica. Mas confira antes as regras de utilização de cada restaurantes que ficam disponíveis antes mesmo da sua associação, pois alguns restaurantes podem restringir um prato específico.',
    },
    {
        cardID: 9,
        title: 'OS VOUCHERS VALEM PARA RODÍZIOS/FESTIVAIS NOS RESTAURANTES QUE TEM ESSA MODALIDADE?',
        content: 'Depende de cada restaurante. Por isso deixamos as regras de utilizações disponíveis para você ler antes e analisar. Alguns sim, outros não. Porém ambos são muito valiosos, imagina pedir duas barcas grandes de sushis e pagar apenas uma? Hmmm delícia.',
    },
    {
        cardID: 10,
        title: 'EU NÃO TENHO CARTÃO POSSO ME ASSOCIAR COM PAGAMENTO EM DINHEIRO?',
        content: 'Nossa associação é feita exclusivamente via débito recorrente em cartão. Você pode utilizar o cartão de seu pai, mãe, namorado(a), amigo(a), esposa, marido, etc.',
    },
    {
        cardID: 11,
        title: 'POSSO DAR UM VOUCHER OU MEU CELULAR PARA UM FILHO OU AMIGO USAR NO RESTAURANTE?',
        content: 'Não pode. O uso dos vouchers é pessoal ao titular da conta.',
    },
    {
        cardID: 12,
        title: 'COMO ME ASSOCIAR?',
        content: 'Basta baixar o nosso app na PlayStore ou na AppStore, “Clube Rota Gourmet” e fazer o cadastro. Muito simples e fácil.',
    },
    {
        cardID: 13,
        title: 'QUAL O PRAZO DE UTILIZAÇÃO DOS VOUCHERS?',
        content: 'Não tem prazo de utilização. Sinta-se livre de ir quando quiser. Ah, mas tem um detalhe. Assim como entram restaurantes continuamente, alguns podem sair. Então não guarde para amanhã aquela fome especial que tem hoje. Corre lá pra usar seu voucher.',
    },
    {
        cardID: 14,
        title: 'SÃO QUANTOS RESTAURANTES POR CIDADE?',
        content: 'Não conseguimos sanar essa dúvida sua. Mas por um bom motivo! Estamos em constante expansão. Portanto, as cidades aumentarão constantemente, assim como os restaurantes na sua cidade. Alguns podem sair, mas outros estarão sempre entrando.',
    },
    {
        cardID: 15,
        title: 'NO VOUCHER ESTÁ INCLUÍDO TAXA DE SERVIÇO, COMBOS OU COUVERT ARTÍSTICO?',
        content: 'O benefício do associado está ligado tão somente ao prato. Por isso não altera a cobrança de couvert artístico, taxa de serviço ou combos promocionais.',
    },
    {
        cardID: 16,
        title: 'COMO FUNCIONA QUANDO NÃO SÃO PRATOS A LA CARTE?',
        content: 'No caso do self-service, no pedido por gramas e rodízio, o funcionamento não muda. Se dois rodízios, um será bonificado, se consumidos dois pratos por self-service por kg ou carne por gramas, o de menor custo será o bonificado. No caso da carne por exemplo, que existem preços por kg diferentes: você pede 500g de fraldinha, e 400g de Angus. Embora o peso de Angus seja menor, o preço final do prato é maior. Portanto a fraldinha será bonificada.',
    },
    {
        cardID: 17,
        title: 'COMO FUNCIONA QUANDO SENTO EM UMA MESA COM UM CASAL DE AMIGOS QUE NÃO TEM O PASSAPORTE ROTA GOURMET?',
        content: 'O Rota Gourmet funciona para o consumo da mesa, independente de quem seja o associado. Ou seja, se você estiver com mais pessoas na mesa, mesmo que eles não tiverem o passaporte Rota Gourmet, o prato bonificado pelo Clube será o de menor consumo lançado na conta, independente se quem pediu foi o associado Rota Gourmet ou os acompanhantes da mesa. Não se preocupe com os valores dos pratos, a ideia é interagir com mais pessoas em ambientes agradáveis que selecionamos para você.',
    },
    {
        cardID: 18,
        title: 'COMO FUNCIONA SE PEÇO MAIS DE DOIS PRATOS?',
        content: 'O benefício não muda. Pedindo dois ou mais pratos iguais, um deles fica por nossa conta. Pedindo dois ou mais pratos diferentes, independente se são considerados entradas, pratos principais, sobremesas, ou a ordem em que foram pedidos; o prato de menor valor fica por nossa conta. Salvo alguma peculiaridade do restaurante (consulte as regras de utilização do restaurante). Mas por exemplo: Se pedirem três pratos iguais, um deles nós bancamos certo? Se forem três pratos diferentes, porém todos do mesmo valor. Não tem problema, um fica por nossa conta. Mas, se pedirem primeiro um prato de R$.100,00, depois um outro prato de R$.95,00, e por fim um prato de R$.70,00; nesse caso, você ganha o de R$.70,00.',
    },
    {
        cardID: 19,
        title: 'O QUE MUDOU NO CLUBE ROTA GOURMET EM 2019?',
        content: 'Muitas coisas mudaram! Para melhor. Pra começar, agora não ficamos mais engessados em apenas os restaurantes do lançamento, constantemente, poderão ser incluídos novos restaurantes. Uma boa novidade também é que agora, você pode utilizar seu benefício mais vezes em um mesmo restaurante. Antes era uma vez por edição, agora como temos mais edições, dependendo do restaurante, você pode utilizar diariamente, mensalmente, bimestralmente, trimestralmente ou semestralmente. Outra coisa, agora, a associação não é mais R$100,00, e sim uma mensalidade de apenas R$19,90, podendo cancelar quando quiser. Além do que, você sendo associado Rota Gourmet, poderá utilizar seu benefício em todas as cidades que tivermos restaurantes parceiros, sem pagar nenhum adicional. Parece mentira não é mesmo? Pra fechar com chave de ouro, você não precisa mais se lembrar de pegar o passaporte do associado, pois terá isso tudo na palma da mão, pois tudo estará no aplicativo, desde consultas até a utilização.',
    }
  ];

export default class FAQ extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = { 
            arrowSize: 15,
            activeSections: [],
            collapsed: false,
        }
        this.renderHeader = this.renderHeader.bind(this);
        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
        }

    }

    componentWillUnmount(){
        this._isMounted = false;

    }

    _updateSections = (activeSections) => {
        activeSections && activeSections[0] ? this.openCardScroll(activeSections[0]) : null
        this.setState({ activeSections: activeSections });
    };

    openCardScroll = (cardID) => {
        let index = 0;
        for (let i = 0; i < SECTIONS.length; i++) {
            let element = SECTIONS[i];
            if (element.cardID == cardID) {
                index = (i * 84);
                element.closed = false;
            } else {
                element.closed = true;
            }
        }
        //accordion: tempo suficiente para fechar o outro card e abrir o novo
        setTimeout(() => {
            this.refs.homeScroll.scrollTo({ x: 0, y: index-35, animated: true });
        }, 250)
    }

    renderHeader = (section, index) => {
        return (
            <View key={index} style={[styles.topContainerAccordion, def_styles.m_t_15, {borderBottomRightRadius: this.state.activeSections && index == this.state.activeSections[0] ? 0 : 6, borderBottomLeftRadius: this.state.activeSections && index == this.state.activeSections[0] ? 0 : 6}]}>
                <View style={{flex: 10}}>
                    <Text style={styles.itemClickableLabel}>{section.title}</Text>
                </View>

                <View style={{flex: 1, alignItems: 'flex-end',}}>
                    <Icon name={this.state.activeSections && index == this.state.activeSections[0] ? 'chevron-down' : 'chevron-right'} type='font-awesome' color={COLOR.SECONDARY} style={{}} size={this.state.arrowSize} />
                </View>
            </View>
        );
    };

    renderContent = (section) => {
        return (
            <View style={styles.headerContent}>
                <View style={styles.contentInner}>
                    <Text style={styles.labelContent}>{section.content}</Text>
                </View>
            </View>
            );
        };

    render(){
        return(
            <View style={styles.flex1}>
                <Pageheader title={"PERGUNTAS FREQUENTES"} navigation={this.props.navigation}/>
                <ScrollView ref={"homeScroll"} style={[styles.bgColorWhite, def_styles.p_h_15]} contentContainerStyle={[ def_styles.p_b_150]}>
                    <Accordion
                        sections={SECTIONS}
                        underlayColor={"transparent"}
                        activeSections={this.state.activeSections}
                        renderHeader={this.renderHeader}
                        renderContent={this.renderContent}
                        onChange={this._updateSections}
                        // touchableComponent={() => this.renderHeader}
                    />
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    labelContent: {
        fontSize: FONT.XSMALL, 
        color: COLOR.GREY, 
        fontWeight: WEIGHT.THIN,
        // padding: 5,
        flexWrap: 'wrap', alignItems: 'flex-start',
        // flexDirection: 'row',
        // width: width - 90,
        
    },
    contentInner: {
        flex: 1,
        paddingLeft: 5,
    },
    headerContent: {
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        paddingBottom: 15, 
        paddingHorizontal: 15, 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,
        backgroundColor: "#ffffff",
    },
    itemClickableLabel: {
        color: COLOR.GREY,
        paddingLeft: 5,
        fontWeight: WEIGHT.MEDIUM,
        fontSize: FONT.SMALL, 
    },
    flexMiddle: {
        paddingTop: responsiveHeight(21),
        justifyContent: 'center',
        // alignItems: 'center'
    },
    topContainerAccordion: {
        borderTopRightRadius: 6, 
        borderTopLeftRadius: 6,
        backgroundColor: COLOR.WHITE,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15, 
        paddingHorizontal: 15 , 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.15,
        shadowRadius: 1.68,
        elevation: 4,
    },
    flex1: {
        flex: 1
    },
});