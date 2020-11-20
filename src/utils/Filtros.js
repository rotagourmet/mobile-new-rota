import { AsyncStorage } from 'react-native';

const Filter = {

    basic (restaurantes, filters) {
        console.log('filters', filters);
        const days = [ 'seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
        let { diasUso, atividade, horario, ordenarPor } = filters
        let diasDeUsoSelecionado = [];
        let horarioSelecionado = [];
        let atividadeSelecionado = [];
        if (diasUso) {    
            restaurantes.map(function(item) {
                item.modeloNegocio.map((mdn) => {
                        if (mdn.status) {
                            if (mdn.diasAceitacao[diasUso + "Noite"] || mdn.diasAceitacao[diasUso + "Dia"]) {
                                diasDeUsoSelecionado.push(item)
                            }
                        }
                });
            });
            // console.log('diasDeUsoSelecionado array', diasDeUsoSelecionado);
        }
        if (horario) {
            if (diasDeUsoSelecionado && diasDeUsoSelecionado.length > 0) {
                diasDeUsoSelecionado.map((item) => {
                    item.modeloNegocio.map((mdn) => {
                        if (mdn.status) {
                            if (horario == "Manhã") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "05:00" && mdn.diasAceitacao[day + "Fim"] <= "10:30"){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            } else if (horario == "Almoço") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "10:30" && mdn.diasAceitacao[day + "Fim"] <= "14:00"){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            } else if (horario == "Tarde") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "14:00" && mdn.diasAceitacao[day + "Fim"] <= "17:30"){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            } else if (horario == "Jantar") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "18:00" && (mdn.diasAceitacao[day + "Fim"] <= "23:30" || mdn.diasAceitacao[day + "Fim"] == "00:00")){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            }
                        }
                    });
                });
            }else{
                restaurantes.map((item) => {
                    item.modeloNegocio.map((mdn) => {
                        if (mdn.status) {
                            if (horario == "Manhã") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "05:00" && mdn.diasAceitacao[day + "Fim"] <= "10:30"){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            } else if (horario == "Almoço") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "10:30" && mdn.diasAceitacao[day + "Fim"] <= "14:00"){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            } else if (horario == "Tarde") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "14:00" && mdn.diasAceitacao[day + "Fim"] <= "17:30"){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            } else if (horario == "Jantar") {
                                for (const day of days) {
                                    if(mdn.diasAceitacao[day + "Inicio"] >= "18:00" && (mdn.diasAceitacao[day + "Fim"] <= "23:30" || mdn.diasAceitacao[day + "Fim"] == "00:00")){
                                        horarioSelecionado.push(item)
                                    }   
                                }
                            }
                        }
                    });
                });
            }
            // console.log('horarioSelecionado array', horarioSelecionado);
        }
        if (atividade) {
            if (horarioSelecionado && horarioSelecionado.length > 0) {
                horarioSelecionado.map((item) => {
                    item.modeloNegocio.map((mdn) => {
                        if (mdn.name == atividade && mdn.status) {
                            atividadeSelecionado.push(item)
                        }
                    })
                })
            }else if(diasUso){
                diasDeUsoSelecionado.map((item) => {
                    item.modeloNegocio.map((mdn) => {
                        if (mdn.name == atividade && mdn.status) {
                            atividadeSelecionado.push(item)
                        }
                    })
                })
            }else{
                restaurantes.map((item) => {
                    item.modeloNegocio.map((mdn) => {
                        if (mdn.name == atividade && mdn.status) {
                            atividadeSelecionado.push(item)
                        }
                    })
                })
            } 
            // console.log('atividadeSelecionado array', atividadeSelecionado);
        }
        let arrayFinal = atividadeSelecionado.concat(diasDeUsoSelecionado, horarioSelecionado)
        arrayFinal = arrayFinal.filter(function (a) {
            return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
        }, Object.create(null))
        if (arrayFinal && arrayFinal.length == 0) {
            arrayFinal = restaurantes;
        }
        if (ordenarPor === "distancia") {
            arrayFinal = arrayFinal.sort((a, b) => {
                    let aDist = a.distance ? a.distance.replace(/[^\d]+/g, '') : "0";
                    let bDist = b.distance ? b.distance.replace(/[^\d]+/g, '') : "0";
                    return parseFloat(aDist) - parseFloat(bDist)
            })
        }

        // console.log('arrayFinal', arrayFinal);
        return arrayFinal

    },
}

export default Filter;