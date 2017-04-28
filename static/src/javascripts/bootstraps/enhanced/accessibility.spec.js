// @flow
import { DOM_ID, init } from 'bootstraps/enhanced/accessibility';
import accessibility from 'common/modules/accessibility/main';
import { local as storage } from 'lib/storage';
import qwery from 'qwery';
import bonzo from 'bonzo';

describe('Accessibility', () => {
    beforeEach(() => {
        if (document.body) {
            document.body.innerHTML = `<div id="${DOM_ID}"></div>`;
        }
    });

    const originalSaveState = accessibility.saveState;

    const installSpy = () => {
        let onSaveCallback;
        jest.spyOn(accessibility, 'saveState').mockImplementation(() => {
            setTimeout(onSaveCallback, 10);
            return originalSaveState.apply(accessibility, arguments);
        });
        return (fn, callback) => {
            onSaveCallback = callback;
            fn();
        };
    };

    const storedValue = () =>
        storage.get(`gu.prefs.${accessibility.KEY_PREFIX}.flashing-elements`);

    it('toggles from unknown', done => {
        window.localStorage.clear();

        const run = installSpy();
        init(() => {
            const checkbox = bonzo(
                qwery('input[data-link-name=flashing-elements]')
            );
            expect(checkbox.attr('checked')).toBe(true);
            expect(accessibility.isOn('flashing-elements')).toBe(true);
            run(
                () => {
                    checkbox[0].click();
                },
                () => {
                    expect(checkbox.attr('checked')).toBe(false);
                    expect(storedValue()).toBe(false);
                    expect(accessibility.isOn('flashing-elements')).toBe(false);
                    run(
                        () => {
                            checkbox[0].click();
                        },
                        () => {
                            expect(checkbox.attr('checked')).toBe(true);
                            expect(storedValue()).toBe(true);
                            expect(
                                accessibility.isOn('flashing-elements')
                            ).toBe(true);
                            done();
                        }
                    );
                }
            );
        });
    });

    it('initializes to known value', done => {
        window.localStorage.clear();
        storage.set(
            `gu.prefs.${accessibility.KEY_PREFIX}.flashing-elements`,
            false
        );
        const run = installSpy();
        init(() => {
            const checkbox = bonzo(
                qwery('input[data-link-name=flashing-elements]')
            );
            expect(checkbox.attr('checked')).toBe(false);
            expect(accessibility.isOn('flashing-elements')).toBe(false);
            run(
                () => {
                    checkbox[0].click();
                },
                () => {
                    expect(checkbox.attr('checked')).toBe(true);
                    expect(storedValue()).toBe(true);
                    expect(accessibility.isOn('flashing-elements')).toBe(true);
                    done();
                }
            );
        });
    });
});
