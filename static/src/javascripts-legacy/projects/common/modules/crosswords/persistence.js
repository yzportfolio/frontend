// @flow
import { local as storage } from 'lib/storage';
import map from 'lodash/collections/map';

var localStorageKey = function(id) {
    return 'crosswords.' + id;
};

function saveGridState(id, grid) {
    /**
     * Take only the entries from the grid. Other state information like what cells are highlighted ought not
     * to be persisted.
     */
    var entries = map(grid, function(row) {
        return map(row, function(cell) {
            return cell.value;
        });
    });

    try {
        return storage.set(localStorageKey(id), entries);
    } catch (e) {
        return false;
    }
}

var loadGridState = function(id) {
    return storage.get(localStorageKey(id));
};

export default {
    saveGridState: saveGridState,
    loadGridState: loadGridState,
};
