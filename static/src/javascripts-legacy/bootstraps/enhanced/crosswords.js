// @flow
import initCrosswords from 'common/modules/crosswords/main';
import initComments from 'common/modules/crosswords/comments';
import initSeries from 'common/modules/crosswords/series';

export function init() {
    initCrosswords();
    initComments();
    initSeries();
}
