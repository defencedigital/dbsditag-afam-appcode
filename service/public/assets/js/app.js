var backButtonEl = document.querySelector('.back-button-element');
backButtonEl === null || backButtonEl === void 0 ? void 0 : backButtonEl.addEventListener('click', function (e) {
    e.preventDefault();
    window.history.back();
});


window.GOVUKFrontend.initAll()

