const _ = require('lodash');
const cheerio = require('cheerio');
const config = require('../config');

module.exports = {
    marshall: (trackId, absPos, element) => {
        
        const dir = element.baliisi.suunta == 'nouseva' ? 'up' : 'down';
        const sijainti = _.find(element.ratakmsijainnit, { ratanumero: trackId });

        const $ = cheerio.load('<balise/>', config.cheerio);
        $('balise').attr('id', element.tunniste);
        $('balise').attr('name', element.nimi);
        $('balise').attr('pos', sijainti.etaisyys);
        $('balise').attr('absPos', absPos + sijainti.etaisyys);
        $('balise').attr('dir', dir);

        return $.html();        
    }
};