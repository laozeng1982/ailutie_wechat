/**
 * Define a ArrayList data structure
 * Base on "Data Structures & Algorithms with JavaScript" by Michel McMillan
 * Modify append, find, length methods
 * Version: V1.0
 * Date: 2017-9-12
 */
class ArrayList {
    constructor() {
        this.pos = 0;
        this.dataStore = [];
    }

    /**
     * append the given element to the tail of the list, do not check if the given element duplicated
     * @param element
     */
    append(element) {
        this.dataStore.push(element);
    }

    /**
     * Core Method, find the element in this list
     * If the element is an object, make sure the class of this element has a proper "equals" method.
     * @param element
     * @returns {number} if this list has the element, return the position of the element, else return -1
     */
    find(element) {
        if (typeof element === "object") {
            for (let position = 0; position < this.dataStore.length; position++) {
                if (this.dataStore[position].equals(element)) {
                    return position;
                }
            }
        } else {
            for (let position = 0; position < this.dataStore.length; position++) {
                if (this.dataStore[position] === element) {
                    return position;
                }
            }
        }

        return -1;
    }

    /**
     * remove the given element if it exists.
     * @param element
     * @returns {boolean}
     */
    remove(element) {
        let foundAt = this.find(element);
        if (foundAt > -1) {
            this.dataStore.splice(foundAt, 1);
            return true;
        } else {
            return false;
        }
    }

    /**
     * insert element to after the element "after".
     * @param element, the element you want to insert
     * @param after, the element you want to insert after
     * @returns {boolean} return true if insert successfully
     */
    insert(element, after) {
        let insertPos = this.find(after);
        if (insertPos > -1) {
            this.dataStore.splice(insertPos + 1, 0, element);
            return true;
        }

        return false;
    }

    /**
     *
     * @param element
     * @returns {boolean}
     */
    contains(element) {
        return this.find(element) > -1;
    }

    /**
     * clear this list
     */
    clear() {
        delete this.dataStore;
        this.dataStore = [];
        this.pos = 0;
    }

    front() {
        this.pos = 0;
    }

    end() {
        this.pos = this.length() - 1;
    }

    prev() {
        if (this.pos >= 0) {
            --this.pos;
        }
    }

    next() {
        if (this.pos < this.length()) {
            ++this.pos;
        }
    }

    currPos() {
        return this.pos;
    }

    moveTo(position) {
        if (position >= 0 && position < this.length()) {
            this.pos = position;
            return true;
        } else {
            return false;
        }
    }

    getElement() {
        return this.dataStore[this.pos];
    }

    /**
     * get element at the given position
     * @param position
     * @returns {*}
     */
    getElementAt(position) {
        if (position >= 0 && position < this.length()) {
            return this.dataStore[position];
        } else {
            console.error("Wrong Index");
            return null;
        }
    }

    length() {
        return this.dataStore.length;
    }

    toString() {
        return this.dataStore;
    }

}

module.exports = {
    ArrayList: ArrayList
};