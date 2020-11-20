const envs = {
    api: {
        //  url: 'http://localhost:3000/', //LOCAL
        // url: "https://api-sandbox.cluberotagourmet.com.br/"  //TEST
        url: "https://api-v1.cluberotagourmet.com.br/", //PROD
    }
}

module.exports.getApi = (env) => {
    return envs[env];
}