define([
    'Promise',
    'lib/fetch-json',
    'lib/cookies',
    'lib/storage',
    'lib/report-error',
    'lib/config'
], function(
    Promise,
    fetchJson,
    cookies,
    storage,
    reportError,
    config
) {

    // TODO move this to tailor.js

    var genericQueryparamters = {
        edition: config.page.edition
    };

    // IDEA: have a generic function that reads all the cookies and sets all the query params for all the modules
    // this is READ-ONLY; all the write specific bits are handled by the various modules
    // We go through the list of surveys that have already been shown to the user, and return a list of survey ids
    // that aren't currently allowed to be shown.

    function getSurveyIdsNotToShow() {
        var currentCookieValues = cookies.getCookie('GU_TAILOR_SURVEY');
        console.log("current value for GU_TAILOR_SURVEY cookie = ")
        console.log(currentCookieValues)

        var values = currentCookieValues ? currentCookieValues.split(',') : [];

        var isAfterToday = function (cookieValue) {
            var date = cookieValue.split('=')[1];
            return new Date(date).valueOf() > new Date().valueOf();
        };

        var surveysWeCannotShow = values.filter(isAfterToday);

        return surveysWeCannotShow.map(function (idAndDate) {
            return idAndDate.split('=')[0];
        }).toString();
    }

    var URLS = {
        suggestions: 'https://tailor.guardianapis.com/suggestions?browserId='
    };

    var browserId = cookies.getCookie('bwid');

    function getURL(type) {
        var baseURL = URLS[type];


        if (!browserId || !baseURL) return;

        baseURL += browserId;

        // get the list of surveys that can't be shown as they have been shown recently
        var surveysNotToShow = getSurveyIdsNotToShow();
        console.log("supposed to be not showing ")
        console.log(surveysNotToShow)

        if (surveysNotToShow) {
            genericQueryparamters.surveysNotToShow = surveysNotToShow;
        }

        // If we want to force tailor to show a particular survey we can set an attribute in local storage to have
        // key = 'surveyToShow', and value = the survey id. Tailor will then override other logic for display, and
        // look for a survey with this ID to return. This is useful as we can easily see how a particular survey
        // would be rendered, without actually putting it live. If this parameter is empty or not specified, tailor
        // behaves as usual.
        var surveyToShow = localStorage.getItem('surveyToShow');
        console.log("supposed to be showing " + surveyToShow)

        if (surveyToShow) {
            genericQueryparamters.surveyToShow = surveyToShow;
        }

        // add specific query params to generic query params if exists
        if (genericQueryparamters) {
            console.log("printing query params ")
            console.log(genericQueryparamters)
            Object.keys(genericQueryparamters).forEach(function (key) {
                baseURL += '&' + key + '=' + genericQueryparamters[key];
            });
        }

        return baseURL;
    }

    /**
     * type (required) is a string which should match a key in the URLS object
     * bypassStorage a boolean, if true don't retrieve data from local storage
     * queryParams an object literal, each key/value will be query string parameter
     * eg. {foo:'bar', hello:'world'} translates to &foo=bar&hello=world
     *
     **/
    function fetchData(type, bypassStorage) {
        console.log("running fetch_data")
        var url = getURL(type);
        console.log("url = " + url)

        // exit if no valid url end point, or tailor switch is off
        if (!url || !config.switches.useTailorEndpoints) {
            console.log("shutting down call")
            return Promise.resolve({});
        }

        var tailorData = bypassStorage ? null : storage.local.get('gu.tailor');

        // if data in local storage, resolve with this
        if (tailorData && tailorData[url]) {
            return Promise.resolve(tailorData[url]);
        }


        return fetchJson(url)
            .then(handleResponse.bind(null, url))
            .catch(handleError.bind(null, url));
    }

    function handleResponse(url, data) {
        var tailorData = localStorage.getItem('gu.tailor') || {};
        var hour = 1000 * 60 * 60;

        tailorData[url] = data;

        storage.local.set('gu.tailor', tailorData, {expires: Date.now() + hour});

        return Promise.resolve(data);
    }

    function handleError(url, error) {
        reportError(error, {
            feature: 'tailor',
            url: url
        });
    }

    return fetchData;

});

