// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import detect from 'lib/detect';
import loadScript from 'lib/load-script';

function openForesee() {
    loadScript.loadScript(config.libs.foresee);
}

function load() {
    var isNetworkFront = config.page.contentType === 'Network Front',
        isProfilePage = config.page.contentType === 'userid',
        sampleRate = detect.isBreakpoint({
            max: 'mobile',
        })
            ? 0.008
            : 0.006, // 0.8% mobile and 0.6% rest
        sample = Math.random() <= sampleRate,
        hasForcedOptIn = /forceForesee/.test(location.hash);

    // the Foresee code is large, we only want to load it in when necessary.
    if (
        !getCookie('GU_TEST') &&
        !isNetworkFront &&
        !isProfilePage &&
        (window.openForeseeWhenReady || sample || hasForcedOptIn)
    ) {
        openForesee();
    }

    if (window.guardian) {
        window.guardian.openForesee = openForesee;
    }
}

export default {
    load: load,
};
