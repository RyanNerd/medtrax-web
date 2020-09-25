/**
 * Given the searchText and activeDrug determine if the search is valid and return true if so, otherwise false.
 *
 * @param {string} searchText
 * @param {object} activeDrug
 * @returns {boolean}
 */
const isSearchValid = (searchText, activeDrug) => {
    const textLen = searchText ? searchText.length : 0;
    if (activeDrug) {
        let searched;
        const c = searchText.substr(0,1);
        // Is the first character a digit? If so, search the Barcode otherwise search the Drug name
        if (c >= '0' && c <= '9') {
            searched = activeDrug.Barcode;
        } else {
            searched = activeDrug.Drug;
        }
        return searched.substr(0, textLen).toLowerCase() === searchText.substr(0, textLen).toLowerCase();
    }
}

export default isSearchValid;
