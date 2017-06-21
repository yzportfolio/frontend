import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';
export default function() {
    var firstContainer = document.querySelector('.js-insert-team-stats-after');

    if (firstContainer) {
        fetchJson(
            '/' + config.page.pageId + '/fixtures-and-results-container',
            {
                mode: 'cors',
            }
        )
            .then(function(container) {
                if (container.html) {
                    firstContainer.insertAdjacentHTML(
                        'afterend',
                        container.html
                    );
                }
            })
            .catch(function(ex) {
                reportError(ex, {
                    feature: 'tag-fixtures',
                });
            });
    }
}
