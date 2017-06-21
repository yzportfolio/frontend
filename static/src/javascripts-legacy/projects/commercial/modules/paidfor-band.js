// @flow
import { Sticky } from 'common/modules/ui/sticky';
import { commercialFeatures } from 'commercial/modules/commercial-features';

function init() {
    if (!commercialFeatures.paidforBand) {
        return Promise.resolve(false);
    }

    var elem = document.querySelector('.paidfor-band');
    if (elem) {
        new Sticky(elem).init();
    }

    return Promise.resolve();
}

export default {
    init: init,
};
