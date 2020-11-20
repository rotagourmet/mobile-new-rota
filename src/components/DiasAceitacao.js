
import React from 'react';
import { 
    View, 
    Text,
    StyleSheet
} from 'react-native';
import Theme from '../constants/Theme';
const { COLOR, WEIGHT } = Theme;

const DiasAceitacao = ({item}) => {
    
    if (item && item.modeloNegocio[0].status) { // ACOMPANHADO
        return(
            <View style={styles.letrasDiasContent}>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.domDia || item.modeloNegocio[0].diasAceitacao.domNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>D</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.segDia || item.modeloNegocio[0].diasAceitacao.segNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.terDia || item.modeloNegocio[0].diasAceitacao.terNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>T</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.quaDia || item.modeloNegocio[0].diasAceitacao.quaNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.quiDia || item.modeloNegocio[0].diasAceitacao.quiNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.sexDia || item.modeloNegocio[0].diasAceitacao.sexNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[0].diasAceitacao.sabDia || item.modeloNegocio[0].diasAceitacao.sabNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
            </View>
        )
    }else if(item && item.modeloNegocio && item.modeloNegocio[1].status){ // INDIVIDUAL
        return(
            <View style={styles.letrasDiasContent}>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[1].diasAceitacao.domDia || item.modeloNegocio[1].diasAceitacao.domNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>D</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[1].diasAceitacao.segDia || item.modeloNegocio[1].diasAceitacao.segNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[1].diasAceitacao.terDia || item.modeloNegocio[1].diasAceitacao.terNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>T</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[1].diasAceitacao.quaDia || item.modeloNegocio[1].diasAceitacao.quaNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[1].diasAceitacao.quiDia || item.modeloNegocio[1].diasAceitacao.quiNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[1].diasAceitacao.sexDia || item.modeloNegocio[1].diasAceitacao.sexNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[1].diasAceitacao.sabDia || item.modeloNegocio[1].diasAceitacao.sabNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
            </View>
        )
    }else{ // DELIVERY
        return(
            <View style={styles.letrasDiasContent}>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[2].diasAceitacao.domDia || item.modeloNegocio[2].diasAceitacao.domNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>D</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[2].diasAceitacao.segDia || item.modeloNegocio[2].diasAceitacao.segNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[2].diasAceitacao.terDia || item.modeloNegocio[2].diasAceitacao.terNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>T</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[2].diasAceitacao.quaDia || item.modeloNegocio[2].diasAceitacao.quaNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[2].diasAceitacao.quiDia || item.modeloNegocio[2].diasAceitacao.quiNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[2].diasAceitacao.sexDia || item.modeloNegocio[2].diasAceitacao.sexNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, {color: item.modeloNegocio[2].diasAceitacao.sabDia || item.modeloNegocio[2].diasAceitacao.sabNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
        letrasDiasContent: {
        flex: 1, 
        justifyContent: 'flex-end', 
        flexDirection: 'row'
    },
    letrasDias: {
        fontWeight: WEIGHT.FAT,
        paddingRight: 5
    },
});

export default DiasAceitacao;


/*
        PEGAR OS DIAS
            <View style={styles.letrasDiasContent}>
                <Text style={[styles.letrasDias, 
                {color: item.modeloNegocio[0].diasAceitacao.domDia || item.modeloNegocio[0].diasAceitacao.domNoite ||
                item.modeloNegocio[1].diasAceitacao.domDia || item.modeloNegocio[1].diasAceitacao.domNoite ||
                item.modeloNegocio[2].diasAceitacao.domDia || item.modeloNegocio[2].diasAceitacao.domNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>D</Text>

                <Text style={[styles.letrasDias, 
                {color: item.modeloNegocio[0].diasAceitacao.segDia || item.modeloNegocio[0].diasAceitacao.segNoite || 
                item.modeloNegocio[1].diasAceitacao.segDia || item.modeloNegocio[1].diasAceitacao.segNoite || 
                item.modeloNegocio[2].diasAceitacao.segDia || item.modeloNegocio[2].diasAceitacao.segNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, 
                {color: item.modeloNegocio[0].diasAceitacao.terDia || item.modeloNegocio[0].diasAceitacao.terNoite ||
                item.modeloNegocio[1].diasAceitacao.terDia || item.modeloNegocio[1].diasAceitacao.terNoite ||
                item.modeloNegocio[2].diasAceitacao.terDia || item.modeloNegocio[2].diasAceitacao.terNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>T</Text>
                <Text style={[styles.letrasDias, 
                {color: item.modeloNegocio[0].diasAceitacao.quaDia || item.modeloNegocio[0].diasAceitacao.quaNoite ||
                item.modeloNegocio[1].diasAceitacao.quaDia || item.modeloNegocio[1].diasAceitacao.quaNoite || 
                item.modeloNegocio[2].diasAceitacao.quaDia || item.modeloNegocio[2].diasAceitacao.quaNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, 
                {color: item.modeloNegocio[0].diasAceitacao.quiDia || item.modeloNegocio[0].diasAceitacao.quiNoite ||
                item.modeloNegocio[1].diasAceitacao.quiDia || item.modeloNegocio[1].diasAceitacao.quiNoite ||
                item.modeloNegocio[2].diasAceitacao.quiDia || item.modeloNegocio[2].diasAceitacao.quiNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>Q</Text>
                <Text style={[styles.letrasDias, 
                {color: item.modeloNegocio[0].diasAceitacao.sexDia || item.modeloNegocio[0].diasAceitacao.sexNoite ||
                item.modeloNegocio[1].diasAceitacao.sexDia || item.modeloNegocio[1].diasAceitacao.sexNoite ||
                item.modeloNegocio[2].diasAceitacao.sexDia || item.modeloNegocio[2].diasAceitacao.sexNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
                <Text style={[styles.letrasDias, 
                {color: item.modeloNegocio[0].diasAceitacao.sabDia || item.modeloNegocio[0].diasAceitacao.sabNoite || 
                item.modeloNegocio[1].diasAceitacao.sabDia || item.modeloNegocio[1].diasAceitacao.sabNoite || 
                item.modeloNegocio[2].diasAceitacao.sabDia || item.modeloNegocio[2].diasAceitacao.sabNoite ? COLOR.SECONDARY : COLOR.GREY_WHITE }]}>S</Text>
            </View>
*/