import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';

export default {
    IMAGES: {
        logoDourada: require('../assets/images/dourado.png'),
        logoBranca: require('../assets/images/Branco-sem-fundo.png'),
        logoPreta: require('../assets/images/preto.png'),
    },
    COLOR: {
        PRIMARY: '#D9A94A',
        SECONDARY: '#FFBC00',
        PRIMARY_DISABLED: 'rgba(217,169,74,0.6)',
        DEFAULT: '#172B4D',
        LABEL: '#FE2472',
        INFO: '#11CDEF',
        ERROR: '#F5365C',
        BLACK: '#292929',
        GREY: '#58595C',
        GREY_WHITE: '#bec3cc',
        GREY_XWHITE: '#F2F2F2',
        BACKGROUND: '#F8F8FA',
        WHITE: '#FFFFFF',
        WHITE_DISABLED: 'rgba(255,255,255,0.6)',
        WHITE_DISABLED2: 'rgba(0,0,0,0.2)',
    },
    FONT: {
        LABEL: responsiveFontSize(1.4),
        XSMALL: responsiveFontSize(1.6),
        SMALL: responsiveFontSize(1.8),
        SMEDIUM: responsiveFontSize(2.0),
        MEDIUM: responsiveFontSize(2.2),
        LARGE: responsiveFontSize(2.4),
        XMLARGE: responsiveFontSize(2.6),
        XLARGE: responsiveFontSize(2.8),
        XXLARGE: responsiveFontSize(3.2),
        XXXLARGE: responsiveFontSize(4.4),
    },
    WEIGHT: {
        THIN: '300',
        MEDIUM: '600',
        FAT: '700',
    }
};