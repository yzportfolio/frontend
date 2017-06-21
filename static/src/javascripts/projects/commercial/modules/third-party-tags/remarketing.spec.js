// @flow

import remarketing from 'commercial/modules/third-party-tags/remarketing';

jest.mock('lib/config', () => ({
    switches: {
        remarketing: true,
    },
}));

describe('Remarketing', () => {
    it('should exist', () => {
        expect(remarketing.shouldRun).toEqual(true);
        expect(remarketing.url).toEqual(
            expect.stringContaining('www.googleadservices.com')
        );
        expect(remarketing.onLoad).toBeDefined();
    });

    it('should call google_trackConversion', () => {
        window.google_trackConversion = jest.fn();
        window.google_tag_params = 'google_tag_params__test';
        remarketing.onLoad();
        expect(window.google_trackConversion).toHaveBeenCalledWith({
            google_conversion_id: 971225648,
            google_custom_params: 'google_tag_params__test',
            google_remarketing_only: true,
        });
    });
});
