(function fill() {
    // The page may have navigated since injection; re-check on every run.
    if (window.location.origin !== '__EXPECTED_ORIGIN__') {
        return;
    }
    var policy = document.getElementById('policyNumber');
    var name = document.getElementById('fullName');
    if (!policy || !name) {
        setTimeout(fill, 200);
        return;
    }

    function setReactValue(el, value) {
        var setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
        ).set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
    }

    setReactValue(policy, '__POLICY_NUMBER__');
    setReactValue(name, '__FULL_NAME__');

    var dob = document.getElementById('dob');
    if (dob) setReactValue(dob, '__DOB__');

    setTimeout(function () {
        if (window.location.origin !== '__EXPECTED_ORIGIN__') {
            return;
        }
        var btn = document.getElementById('form-submit-button')
            || document.querySelector('button[type="submit"]');
        if (btn && !btn.disabled) {
            btn.click();
        } else if (btn) {
            console.log('Submit button found but still disabled — form validation may not have passed');
        } else {
            console.log('Submit button not found');
        }
    }, 600);
})();
