import React from 'react/addons';
import bean from 'bean';
import $ from 'lib/$';
import find from 'lodash/collections/find';
import Crossword from './crossword';

export default function() {
    $('.js-crossword').each(function(element) {
        if (element.hasAttribute('data-crossword-data')) {
            (function() {
                var crosswordData = JSON.parse(element.getAttribute('data-crossword-data'));
                var crosswordComponent = React.render(React.createElement(Crossword, {
                    data: crosswordData
                }), element);

                var entryId = window.location.hash.replace('#', '');
                var entry = find(crosswordComponent.props.data.entries, {
                    id: entryId
                });
                if (entry) {
                    crosswordComponent.focusFirstCellInClue(entry);
                }

                bean.on(element, 'click', $('.crossword__clue'), function(e) {
                    var idMatch = e.currentTarget.hash.match(/#.*/);
                    var newEntryId = idMatch && idMatch[0].replace('#', '');

                    var newEntry = find(crosswordComponent.props.data.entries, {
                        id: newEntryId
                    });
                    var focussedEntry = crosswordComponent.clueInFocus();
                    var isNewEntry = focussedEntry && focussedEntry.id !== newEntry.id;
                    // Only focus the first cell in the new clue if it's not already
                    // focussed. When focussing a cell in a new clue, we update the
                    // hash fragment afterwards, in which case we do not want to
                    // reset focus to the first cell.
                    if (newEntry && (focussedEntry ? isNewEntry : true)) {
                        crosswordComponent.focusFirstCellInClue(newEntry);
                    }

                    e.preventDefault();
                });
            })();
        } else {
            throw 'JavaScript crossword without associated data in data-crossword-data';
        }
    });
}
