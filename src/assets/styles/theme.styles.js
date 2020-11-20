import { StyleSheet } from 'react-native';
import Theme from '../../constants/Theme';
const { COLOR, IMAGES, FONT, WEIGHT } = Theme;

export default  StyleSheet.create({

    // FONT SIZE DEFAULT
    font_label:{
        fontSize: FONT.LABEL
    },
    font_xsmall:{
        fontSize: FONT.XSMALL
    },
    font_small:{
        fontSize: FONT.SMALL
    },
    font_smedium:{
        fontSize: FONT.SMEDIUM
    },
    font_medium:{
        fontSize: FONT.MEDIUM
    },
    font_large:{
        fontSize: FONT.LARGE
    },
    font_xmlarge:{
        fontSize: FONT.XMLARGE
    },
    font_xlarge:{
        fontSize: FONT.XLARGE
    },
    font_xxlarge:{
        fontSize: FONT.XXLARGE
    },
    font_xxxlarge:{
        fontSize: FONT.XXXLARGE
    },


    // WEIGHT DEFAULT
    weight_thin:{
        fontWeight: WEIGHT.THIN,
    },
    weight_medium:{
        fontWeight: WEIGHT.MEDIUM,
    },
    weight_fat:{
        fontWeight: WEIGHT.FAT,
    },

    // COLORS DEFAULT
    color_white:{
        color: COLOR.WHITE,
    },

    // BACKGROUND COLOR DEFAULTS
    bg_white: {
        backgroundColor: COLOR.WHITE
    },
    bg_white_grey: {
        backgroundColor: COLOR.BACKGROUND
    },


    //PADDINGS DEFAULTS
    padding_10: {
        padding: 10
    },
    padding_20: {
        padding: 20
    },
    padding_30: {
        padding: 30
    },
    
    //TOP
    p_t_5: {
        paddingTop: 5
    },
    p_t_10: {
        paddingTop: 10
    },
    p_t_15: {
        paddingTop: 15
    },
    p_t_20: {
        paddingTop: 20
    },
    p_t_25: {
        paddingTop: 25
    },
    // LEFT
    p_l_5: {
        paddingLeft: 5
    },
    p_l_10: {
        paddingLeft: 10
    },
    p_l_20: {
        paddingLeft: 20
    },
    // RIGHT
    p_r_5: {
        paddingRight: 5
    },
    p_r_10: {
        paddingRight: 10
    },
    p_r_20: {
        paddingRight: 20
    },

    p_v_15: {
        paddingVertical: 15
    },
    p_v_20: {
        paddingVertical: 20
    },
    p_v_30: {
        paddingVertical: 30
    },

    p_h_10: {
        paddingHorizontal: 10
    },
    p_h_15: {
        paddingHorizontal: 15
    },
    p_h_20: {
        paddingHorizontal: 20
    },
    p_h_25: {
        paddingHorizontal: 25
    },
    p_h_30: {
     
        paddingHorizontal: 30
    },
    p_b_10: {
        paddingBottom: 10
    },
    p_b_15: {
        paddingBottom: 15
    },
    p_b_100: {
        paddingBottom: 100
    },
    p_b_150: {
        paddingBottom: 150
    },
    p_b_300: {
        paddingBottom: 300
    },


    //MARGINS DEFAULTS
    m_l_5: {
        marginLeft: 5
    },
    m_l_10: {
        marginLeft: 10
    },
    m_r_5: {
        marginRight: 5
    },
    m_r_10: {
        marginRight: 10
    },
    
    m_t_10: {
        marginTop: 10
    },
    m_t_15: {
        marginTop: 15
    },
    m_t_20: {
        marginTop: 20
    },
    m_t_30: {
        marginTop: 30
    },
    m_t_100: {
        marginTop: 100
    },
    m_t_300: {
        marginTop: 300
    },
    
    m_b_10: {
        marginBottom: 10
    },
    m_b_20: {
        marginBottom: 20
    },
    m_b_30: {
        marginBottom: 30
    },
    m_b_100: {
        marginBottom: 100
    },
    m_b_300: {
        marginBottom: 300
    },
    
    
    // FLEX AJUSTMENTS
    d_flex_1: {
        flex: 1
    },
    flexRow: {
        flexDirection: 'row'
    },
    justify_content_center: {
        justifyContent: 'center'
    },
    justify_content_between: {
        justifyContent: 'space-between'
    },
    align_items_center: {
        alignItems: 'center'
    },    
    d_flex_complete_center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },



    
});