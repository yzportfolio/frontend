// @flow
import articleLiveblogCommon from 'bootstraps/enhanced/article-liveblog-common';
import { init as initTrail } from 'bootstraps/enhanced/trail';
import fullHeight from 'common/modules/ui/full-height';
var ready = function() {
    articleLiveblogCommon();
    initTrail();
    fullHeight.init();
};

export { ready as init };
