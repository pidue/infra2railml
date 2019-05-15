const _ = require('lodash');

/**
 * Tells if the given element is anyhow related to specified rail,
 * regardless of it's track number, position etc.
 */
function isRailElement(railId, element) {
    return _.flatMap(element.raiteet, 'tunniste').includes(railId);
}

/**
 * Ensures the given element is somewhere between rail begin and
 * end positions, thus "on rail".
 */
function isOnRail(element, trackId, raideAlku, raideLoppu) {
    const sijainti = _.find(element.ratakmsijainnit, { ratanumero: trackId });
    return isBetween(raideAlku, raideLoppu, sijainti);
}

/**
 * Tells if the given speed change is between rail begin and end points.
 */
function isSpeedChangeOnRail(raideRataNr, raideAlku, raideLoppu, nopeudet) {
    const { ratanumero, alku } = nopeudet.ratakmvali;
    return ratanumero === raideRataNr && isBetween(raideAlku, raideLoppu, alku);
}

/**
 * Tells if hte given kilometer/mileage post is within given track range.
 */
function isMilepostOnRail(ratanumero, alku, loppu, km) {
    return km.ratanumero === ratanumero &&
        (km.ratakm > alku.ratakm && km.ratakm <= loppu.ratakm);
}

/**
 * Tells if the given element is located exactly at the specified
 * rail begin or end point.
 */
function isAtRailEnds(element, trackId, raideAlku, raideLoppu) {
    const sijainti = _.find(element.ratakmsijainnit, { ratanumero: trackId });
    return isBeginOrEnd(raideAlku, raideLoppu, sijainti);
}

/**
 * Tells if given position (km+distance) is within given begin/end positions.
 */
function isBetween(alku, loppu, sijainti) {
    return !_.isEmpty(alku) && !_.isEmpty(loppu) && !_.isEmpty(sijainti) &&
        (sijainti.ratakm > alku.ratakm && sijainti.ratakm < loppu.ratakm) ||
        ((sijainti.ratakm === alku.ratakm && sijainti.etaisyys >= alku.etaisyys) ||
        (sijainti.ratakm === loppu.ratakm && sijainti.etaisyys <= loppu.etaisyys));
}

/**
 * Tells if given begin or end match the specified position.
 */
function isBeginOrEnd(alku, loppu, sijainti) {
    return !_.isEmpty(alku) && !_.isEmpty(loppu) && !_.isEmpty(sijainti) &&
        ((sijainti.ratakm === alku.ratakm && sijainti.etaisyys === alku.etaisyys) ||
        (sijainti.ratakm === loppu.ratakm && sijainti.etaisyys === loppu.etaisyys));
}


module.exports = {
   isRailElement, isOnRail, isAtRailEnds, isSpeedChangeOnRail, isMilepostOnRail
};