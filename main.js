const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
};

let interval;  // yes, let it

const modeButtons = document.querySelector('#js-mode-buttons');  // make an object to identify the buttons in index.html
modeButtons.addEventListener('click', handleMode);  // add an event listener to handle a click on any mode button

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date);
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);  // total time in seconds remaining (milliseconds -> seconds) convert to int
    const minutes = Number.parseInt((total / 60) % 60, 10);  // whole minutes remaining
    const seconds = Number.parseInt(total % 60, 10);  // seconds remaining aafter calculaating whole minutes

    return {
        total,
        minutes,
        seconds,
    };
}

function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date() + total * 1000);  // current moment in milliseconds + timer total
    
    interval = setInterval(function() {  // functional programming?
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}

function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');  // width of 2, pad empty charas with 0's
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,  // number of seconds remaining = num of minutes * 60
        minutes = timer[mode],
        seconds: 0,  // set to 0 at start of each pomodoro session
    };

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;

    updateClock();
}

function handleMode(event) {
    const { mode } = event.target.dataset;  // accesses the data for the click target, creates a constant to store it

    if (!mode) return;  // taget element was not one of the buttons

    switchMode(mode);  // switch the mode
}