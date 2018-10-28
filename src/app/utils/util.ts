/**
 * s2d-migrator
 *
 * (c) 2018 ryosebach
 */
export default class Utils {
    static stringToDefault = (val: string | undefined): string  => {
        if (val === undefined) {
            return '';
        } else {
            return val;
        }
    }
}
