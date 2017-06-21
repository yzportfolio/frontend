import config from 'lib/config';
import fetch from 'lib/fetch';
export default {
    fire: function(path) {
        var img = new Image();
        img.src = config.page.beaconUrl + path;

        return img;
    },
    postJson: function(path, jsonString) {
        var url =
            (config.page.beaconUrl || '')
                .replace(/^\/\//, window.location.protocol + '//') + path;

        fetch(url, {
            method: 'post',
            header: {
                'Content-Type': 'application/json',
            },
            body: jsonString,
            mode: 'cors',
        });
    },
};
