// @flow

import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import { catchErrorsWithContext } from 'lib/robust';
import { shouldHideFlashingElements } from 'common/modules/accessibility/helpers';
import stocks from 'common/modules/business/stocks';
import { GeoMostPopularFront } from 'facia/modules/onwards/geo-most-popular-front';
import ContainerToggle from 'facia/modules/ui/container-toggle';
import { init as initContainerShowMore } from 'facia/modules/ui/container-show-more';
import { lazyLoadContainers } from 'facia/modules/ui/lazy-load-containers';
import liveblogUpdates from 'facia/modules/ui/live-blog-updates';
import snaps from 'facia/modules/ui/snaps';
import sponsorship from 'facia/modules/ui/sponsorship';
import { Weather } from 'facia/modules/onwards/weather';
import partial from 'lodash/functions/partial';

var modules = {
    showSnaps: function() {
        snaps.init();
        mediator.on('modules:container:rendered', snaps.init);
    },

    showContainerShowMore: function() {
        mediator.addListeners({
            'modules:container:rendered': initContainerShowMore,
            'page:front:ready': initContainerShowMore,
        });
    },

    showContainerToggle: function() {
        var containerToggleAdd = function(context) {
            $('.js-container--toggle', $(context || document)[0]).each(function(
                container
            ) {
                new ContainerToggle(container).addToggle();
            });
        };
        mediator.addListeners({
            'page:front:ready': containerToggleAdd,
            'modules:geomostpopular:ready': partial(
                containerToggleAdd,
                '.js-popular-trails'
            ),
        });
    },

    upgradeMostPopularToGeo: function() {
        if (config.switches.geoMostPopular) {
            new GeoMostPopularFront().go();
        }
    },

    showWeather: function() {
        if (config.switches.weather) {
            mediator.on('page:front:ready', function() {
                Weather.init();
            });
        }
    },

    showLiveblogUpdates: function() {
        if (
            detect.isBreakpoint({
                min: 'desktop',
            })
        ) {
            mediator.on('page:front:ready', function() {
                liveblogUpdates.show();
            });
        }
    },

    finished: function() {
        mediator.emit('page:front:ready');
    },
};
var ready = function() {
    catchErrorsWithContext([
        ['f-accessibility', shouldHideFlashingElements],
        ['f-snaps', modules.showSnaps],
        ['f-show-more', modules.showContainerShowMore],
        ['f-container-toggle', modules.showContainerToggle],
        ['f-geo-most-popular', modules.upgradeMostPopularToGeo],
        ['f-lazy-load-containers', lazyLoadContainers],
        ['f-stocks', stocks],
        ['f-sponsorship', sponsorship],
        ['f-weather', modules.showWeather],
        ['f-live-blog-updates', modules.showLiveblogUpdates],
        ['f-finished', modules.finished],
    ]);
};

export { ready as init };
