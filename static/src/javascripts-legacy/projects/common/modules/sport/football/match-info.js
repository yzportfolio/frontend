import fetchJSON from 'lib/fetch-json';

/**
 * @param {Object} match
 * @param {string} whosCalling (url)
 */
var MatchInfo = function(match, whosCalling) {
    this.endpoint += (match.id ? match.id : [match.date].concat(match.teams).join('/')) +
        '.json?page=' + encodeURIComponent(whosCalling);
};

/**
 * @type {string}
 */
MatchInfo.prototype.endpoint = '/football/api/match-nav/';

/**
 * @return Promise
 */
MatchInfo.prototype.fetch = function() {
    return fetchJSON(this.endpoint, {
        mode: 'cors',
    });
};

export default MatchInfo; // define
