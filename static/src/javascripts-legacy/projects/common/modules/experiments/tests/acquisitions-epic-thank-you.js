import template from 'lodash/utilities/template';
import { isPayingMember } from 'commercial/modules/user-features';
import contributionsUtilities from 'common/modules/commercial/contributions-utilities';
import config from 'lib/config';
import acquisitionsEpicThankYouTemplate from 'raw-loader!common/views/acquisitions-epic-thank-you.html';

function isRecentContributor() {
    return contributionsUtilities.daysSinceLastContribution < 180;
}

function isTargetReader() {
    return isPayingMember() || isRecentContributor();
}

function worksWellWithPageTemplate() {
    return (
        config.page.contentType === 'Article' &&
        !config.page.isMinuteArticle &&
        !(config.page.isImmersive === true)
    );
}

function isTargetPage() {
    return (
        worksWellWithPageTemplate() &&
        !config.page.isPaidContent &&
        !config.page.shouldHideAdverts
    );
}

export default contributionsUtilities.makeABTest({
    id: 'AcquisitionsEpicThankYou',
    campaignId: 'epic_thank_you',

    start: '2017-06-01',
    expiry: '2017-06-19',

    author: 'Guy Dawson',
    description:
        'Bootstrap the AB test framework to use the Epic to thank readers who have already supported the Guardian',
    successMeasure: 'N/A',
    idealOutcome: 'N/A',
    audienceCriteria: 'Readers who have supported the Guardian',
    audience: 1,
    audienceOffset: 0,

    overrideCanRun: true,

    canRun: function() {
        return isTargetReader() && isTargetPage();
    },

    useLocalViewLog: true,

    variants: [
        {
            id: 'control',

            maxViews: {
                days: 365, // Arbitrarily high number - reader should only see the thank-you for one 'cycle'.
                count: 1,
                minDaysBetweenViews: 0,
            },

            template: function(variant) {
                return template(acquisitionsEpicThankYouTemplate, {
                    componentName: variant.options.componentName,
                    membershipUrl: variant.getURL(
                        'https://www.theguardian.com/membership',
                        variant.options.campaignCode
                    ),
                });
            },
        },
    ],
});
