import { StyleSheet } from 'react-native';

export const colors = {
    black: '#1a1917',
    gray: '#888888',
    background1: '#B721FF',
    background2: '#21D4FD'
};

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background1
    },
    scrollview: {
        flex: 1
    },
    slider: {
        // marginTop: 15,
        overflow: 'visible' // for custom animations
    },
    paginationContainer: {
        paddingTop: 0
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: -20
    },

    
});