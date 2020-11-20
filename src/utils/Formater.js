const Formater = {

    phoneNumber: (ph) => {
        let phone = "(" + ph[0] + ph[1] + ") " + ph[2] + ph[3] + ph[4] + ph[5] + ph[6] + "-" + ph[7] + ph[8] + ph[9] + ph[10]
        return phone;
    },
}

export default Formater;