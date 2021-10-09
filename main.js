const timer = {
    pomodoro: .1,
    shortBreak: .1,
    longBreak: .1,
    longBreakInterval: 4,
    sessions: 0,  // used to count how many pomodoro sessions we've had
};

let interval;  // yes, let it

const buttonSound = new Audio('button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
    buttonSound.play();
    const { action } = mainButton.dataset;
    if (action === 'start') {
        startTimer();  // Makes a one-time-use handle function to call startTimer (ooh, functional programming!)
    } else {
        stopTimer();
    }
});

const modeButtons = document.querySelector('#js-mode-buttons');  // make an object to identify the buttons in index.html
modeButtons.addEventListener('click', handleMode);  // add an event listener to handle a click on any mode button

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
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
    const endTime = Date.parse(new Date()) + total * 1000;  // current moment in milliseconds + timer total

    if (timer.mode === 'pomodoro') timer.sessions++;

    // change the appearaance of the start button once the timer has been started
    mainButton.dataset.action = 'stop';  // change action to stop on click. This way we can't keep starting the timer forever
    mainButton.textContent = 'stop';  // change text of button
    mainButton.classList.add('active');  // add 'active' to mainButton's class list
    
    interval = setInterval(function() {  // functional programming?
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();  // update view after timer state has changed

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval);  // check if we have reached zero, terminates countdown if so

            switch(timer.mode) {
                case 'pomodoro':
                    if (timer.sessions % timer.longBreakInterval === 0) {
                        switchMode('longBreak');  // if we've reached the number of consecutive sessions for a long break
                    } else {
                        switchMode('shortBreak');  // if not, time for a short break
                    }
                    break;
                default:
                    switchMode('pomodoro');  // if we're ending a break session, go back to pomodoro mode
            }

            if (Notification.permission === 'granted') {
                const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break';  // same as browser tab
            }
            new Notification(text);

            document.querySelector(`[data-sound="${timer.mode}"]`).play();

            startTimer();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove = 'active';
}

function updateClock() {  // updates view
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');  // width of 2, pad empty charas with 0's
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break';
    document.title = `${minutes}:${seconds} - ${text}`;

    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,  // number of seconds remaining = num of minutes * 60
        minutes: timer[mode],
        seconds: 0,  // set to 0 at start of each pomodoro session
    };

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document
        .getElementById('js-progress')
        .setAttribute('max', timer.remainingTime.total)

    updateClock();
}

function handleMode(event) {
    const { mode } = event.target.dataset;  // accesses the data for the click target, creates a constant to store it

    if (!mode) return;  // taget element was not one of the buttons

    switchMode(mode);  // switch the mode
    stopTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    switchMode('pomodoro');  // makes sure timer's default mode is pomodoro and timer.remainingTime has appropriate content
    // If this code is not present, invoking startTimer() will crash the program because timer.remainingTime will not exist

    // Check if browser supports notifications
    if ('Notification' in window) {
        // if notif permissions have not been graanted or denied
        if ((Notification.permission !== 'granted') && (Notification.permission !== 'denied')) {
            // ask user for permission
            Notification.requestPermission().then(function(permission) {
                // if granted
                if (permission === 'granted') {
                    // create a new notification
                    new Notification(
                        'This site will send a notification at the start of each session.'
                    );
                }
            });
        }
    }

    switchMode('pomodoro');
});