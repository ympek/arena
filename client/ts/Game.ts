// request anim frame bedzie wlasciwie tutaj
// handloweanie keypressow tutaj
// i posylanie przez socket dalej
var handleKeyPress = function (ev : KeyboardEvent) {
    switch (ev.keyCode) {
        case 32: handleKeySpace(); break;
        case 81: handleKeyQ(); break;
        case 87: handleKeyW(); break;
        case 69: handleKeyE(); break;
        case 82: handleKeyR(); break;
    }
};

const handleKeySpace = function () {
    console.log('Handle Key: Space');
};

const handleKeyQ = function () {
    console.log('Handle Key: Q');
};

const handleKeyW = function () {
    console.log('Handle Key: W');
};

const handleKeyE = function () {
    console.log('Handle Key: E');
};

const handleKeyR = function () {
    console.log('Handle Key: R');
};