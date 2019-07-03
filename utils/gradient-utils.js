const _ = require('lodash');
const positionUtils = require('./position-utils');

/**
 * Resolves the slope for given position from the specified slope change
 * points. The returned point may be exact match on position or an assumption
 * based on the nearest known change point. If unable to resolve the point,
 * assumes a flat track.
 * 
 * TODO is matching by position accurate enough?
 */
function getSlope(sijainti, suunta, kaltevuudet) {

    const suuntaan = _.filter(kaltevuudet, { suunta });

    // exact position match
    const onPosition = _.find(suuntaan, (s) => {
        return s.sijainti.ratanumero === sijainti.ratanumero &&
               s.sijainti.ratakm === sijainti.ratakm &&
               s.sijainti.etaisyys === sijainti.etaisyys;
    });

    if (!_.isEmpty(onPosition)) {
        return onPosition;
    }

    /*
    const absPos = positionUtils.getAbsolutePosition(sijainti);
    const preceeding = _.last(_.takeWhile(suuntaan, (slope) =>
        positionUtils.getAbsolutePosition(slope.sijainti) <= absPos
    ));
    */
   const preceeding = _.last(_.takeWhile(suuntaan, (slope) =>
        slope.sijainti.ratakm < sijainti.ratakm ||
        (slope.sijainti.ratakm === sijainti.ratakm && slope.sijainti.etaisyys < sijainti.etaisyys)
    ));
 
    if (_.isEmpty(preceeding)) {
        // TODO how to determine the slope before model beginning?
        return { sijainti, suunta, kaltevuus: 0.0 };
    }

    // no match, assume the preceeding known value
    return { sijainti: sijainti, kaltevuus: preceeding.kaltevuus, suunta: preceeding.suunta };
}

/**
 * Converts the given elevation points to track slope values.
 */
function toSlopes(korkeuspisteet, kilometrit) {
    const sorted = _.sortBy(korkeuspisteet, (k) => positionUtils.getAbsolutePosition(k.sijainti));
    return slopes(sorted, kilometrit, []);
}

/**
 * Recursive calculation of the slopes between given elevation points.
 */
function slopes(korkeuspisteet, kilometrit, kaltevuudet) {

    if (_.isEmpty(_.tail(korkeuspisteet))) {
        return kaltevuudet;
    }

    const head = _.head(korkeuspisteet);
    const tail = _.tail(korkeuspisteet);
    const next = _.first(tail);

    const x = positionUtils.getPosition(head.sijainti, next.sijainti, kilometrit);
    const y = next.korkeus > head.korkeus ? next.korkeus - head.korkeus : head.korkeus - next.korkeus;
    
    if (x <= 0 || y <= 0) {
        return slopes(tail, kilometrit, kaltevuudet);
    }

    const sign = next.korkeus > head.korkeus || next.korkeus === head.korkeus ? 1 : -1;
    const slopePerMille = Math.tan(y/x) * 1000 * sign;

    const slopeUp = Math.round(slopePerMille * 1000) / 1000; // round to three decimals
    const slopeDown = -1.0 * slopeUp;

    kaltevuudet.push({ sijainti: head.sijainti, suunta: 'nouseva', kaltevuus: slopeUp });
    kaltevuudet.push({ sijainti: next.sijainti, suunta: 'laskeva', kaltevuus: slopeDown });        
        
    return slopes(tail, kilometrit, kaltevuudet);
}

module.exports = {
    getSlope, toSlopes
}

