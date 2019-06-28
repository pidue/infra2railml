const _ = require('lodash');
const config = require('../config');
const http = require('./http-client');
const stations = require('./stations');
const Promise = require('bluebird');

function findById(id) {
    
    const url = `${config.infraApi.baseUrl}/raiteet/${id}.json`;

    const options = {
        params: { srsName: 'crs:84', presentation: 'diagram' },
    };

    return http.get(url, options)
        .then((res) => {
            process.stdout.write(`\r\x1b[K${res.status}: ${url}`);
            return _.first(res.data);
        })
        .then((rail) => {
            return new Promise((resolve, reject) => {
                if (!rail.liikennepaikanRaide || _.isObject(rail.liikennepaikanRaide.liikennepaikka)) {
                    resolve(rail);
                } else {
                    return stations.findById(rail.liikennepaikanRaide.liikennepaikka)
                        .then((station) => {
                            rail.liikennepaikanRaide.liikennepaikka = station;
                            return rail;
                        })
                        .then(resolve)
                        .catch(reject);
                }
            });
        })
        .catch((err) => {
            console.error(`\r\x1b[K${err.message}: ${url}`);
            return {};
        });
}

function findAllById(ids) {
    const opts = { concurrency: config.http.concurrency }
    return Promise.map(ids, findById, opts);
}

module.exports = {
    findById, findAllById
}