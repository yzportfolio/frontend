// @flow
import $ from 'lib/$';
import detect from 'lib/detect';
import { getParticipations } from 'common/modules/experiments/utils';
import map from 'lodash/collections/map';
import keys from 'lodash/objects/keys';
import { getCookie } from 'lib/cookies';

var adblockBeingUsed = false;

function getExtraDataInformation() {
    return {
        browser: window.navigator.userAgent,
        page: window.location,
        width: window.innerWidth,
        adBlock: adblockBeingUsed,
        devicePixelRatio: window.devicePixelRatio,
        gu_u: getCookie('GU_U'),
        payingMember: getCookie('gu_paying_member'),
        abTests: summariseAbTests(getParticipations()),
    };
}

function summariseAbTests(testParticipations) {
    var tests = keys(testParticipations);
    if (tests.length === 0) {
        return 'No tests running';
    } else {
        return map(tests, function(testKey) {
            var test = testParticipations[testKey];
            return testKey + '=' + test.variant;
        }).join(', ');
    }
}

function toggleFormVisibility(evt) {
    // make the associated category blurb visible

    $.forEachElement('#feedback-category>option', function(elem) {
        if (elem.selected && elem.value !== 'nothing') {
            document
                .getElementById(elem.value)
                .classList.add('feedback__blurb--selected');
        } else if (elem.value !== 'nothing') {
            document
                .getElementById(elem.value)
                .classList.remove('feedback__blurb--selected');
        }
    });

    // enable the form elements

    $.forEachElement(
        '#feedback__form input,#feedback__form textarea,#feedback__form button',
        function(elem) {
            elem.disabled = evt.target.value == 'nothing';
        }
    );
}

function isInputFilled(elem) {
    return elem.value === '';
}

function initForms() {
    var warning = document.getElementById('feedback__explainer');

    // mandatory checks (on submit)

    $.forEachElement('.feedback__form', function(elem) {
        elem.addEventListener('submit', function() {
            var hasFailed = false;

            $.forEachElement(
                '#feedback__form input,#feedback__form textarea',
                function(elem) {
                    if (!isInputFilled(elem)) {
                        hasFailed = true;
                    }
                }
            );

            if (hasFailed) {
                warning.innerHTML = 'All fields must be filled to proceed';
            }

            return !hasFailed;
        });
    });

    // set the form elements to disabled to begin with

    $.forEachElement(
        '#feedback__form input,#feedback__form textarea,#feedback__form button',
        function(elem) {
            elem.disabled = true;
        }
    );

    // form toggling

    document
        .getElementById('feedback-category')
        .addEventListener('change', toggleFormVisibility, false);

    // insert hidden extra data into forms

    $.forEachElement('#feedback__form input[name=extra]', function(elem) {
        elem.value = JSON.stringify(getExtraDataInformation());
    });
}

export default function() {
    if (document.getElementById('feedback-category')) {
        detect.adblockInUse.then(function(adblockInUse) {
            adblockBeingUsed = adblockInUse;
        });

        initForms();
    }
}
