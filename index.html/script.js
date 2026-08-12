const SUPABASE_URL = "https://dpcaafllcfekrqrskvvv.supabase.co";
const SUPABASE_KEY = "sb_publishable_y2h7_dvmWijw7qT8o_WKSg_hWrX006u";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const audio = new Audio("sunete/usa.mp3");
const clopotel = new Audio("sunete/clopotel.mp3");

function playSound() {
    audio.currentTime = 0;
    audio.play();
}

function playClopotel() {
    clopotel.currentTime = 0;
    clopotel.play();
}

function toggleFavorite(button) {
    const sound = button.closest(".sound");

    if (!sound) return;

    const soundName = sound.querySelector("h2").innerText;
    const key = soundName + "Favorite";

    if (button.innerText.trim() === "♡ Favorite") {
        button.innerText = "♥ Favorit";
        localStorage.setItem(key, "true");
    } else {
        button.innerText = "♡ Favorite";
        localStorage.removeItem(key);
    }

    showFavorites();
}

function showFavorites() {
    const favorites = document.getElementById("favorites");

    if (!favorites) {
        return;
    }

    favorites.innerHTML = "";

    const sounds = document.querySelectorAll(".sounds > .sound");
    let found = false;

    sounds.forEach(function(sound) {
        const name = sound.querySelector("h2").innerText;

        if (localStorage.getItem(name + "Favorite") === "true") {
            const copy = sound.cloneNode(true);

            const volumeControl =
                copy.querySelector(".volume-control");

            if (volumeControl) {
                volumeControl.remove();
            }

            const favoriteButton =
                copy.querySelector(
                    'button[onclick*="toggleFavorite"]'
                );

            if (favoriteButton) {
                favoriteButton.remove();
            }

            favorites.appendChild(copy);
            found = true;
        }
    });

    if (!found) {
        favorites.innerHTML =
            "<p>Niciun sunet favorit încă.</p>";
    }
}

function toggleFavoriteSection() {
    const section =
        document.getElementById("favoriteSection");

    const button =
        document.getElementById("favoriteToggle");

    if (!section || !button) {
        return;
    }

    if (section.style.display === "none") {
        section.style.display = "block";
        button.innerText = "♡ Ascunde favorite";
    } else {
        section.style.display = "none";
        button.innerText = "♡ Vezi favorite";
    }
}

function playRandomSound() {
    const sounds =
        document.querySelectorAll(".sounds .sound");

    if (sounds.length === 0) {
        return;
    }

    const randomIndex =
        Math.floor(Math.random() * sounds.length);

    const randomSound = sounds[randomIndex];

    const soundName =
        randomSound.querySelector("h2").innerText;

    const result =
        document.getElementById("randomResult");

    if (result) {
        result.textContent =
            "Ai nimerit: " + soundName;
    }

    const playButton =
        randomSound.querySelector(
            'button[onclick^="play"]'
        );

    if (playButton) {
        playButton.click();
    }
}

async function signUp() {
    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("authMessage");

    const { error } =
        await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent =
        "Cont creat. Verifică emailul.";
}

async function signIn() {
    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("authMessage");

    const { error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent =
        "Te-ai conectat.";
}

window.addEventListener(
    "DOMContentLoaded",
    function() {

        const usaSlider =
            document.getElementById("usaSlider");

        const usaVolume =
            document.getElementById("usaVolume");

        if (usaSlider && usaVolume) {
            usaSlider.addEventListener(
                "input",
                function() {
                    audio.volume =
                        this.value / 100;

                    usaVolume.textContent =
                        this.value + "%";
                }
            );
        }

        const clopotelSlider =
            document.getElementById("clopotelSlider");

        const clopotelVolume =
            document.getElementById("clopotelVolume");

        if (clopotelSlider && clopotelVolume) {
            clopotelSlider.addEventListener(
                "input",
                function() {
                    clopotel.volume =
                        this.value / 100;

                    clopotelVolume.textContent =
                        this.value + "%";
                }
            );
        }

        const buttons =
            document.querySelectorAll(
                ".sounds > .sound button"
            );

        buttons.forEach(function(button) {

            if (
                button.innerText.trim() ===
                "♡ Favorite"
            ) {
                const soundName =
                    button.parentElement
                        .querySelector("h2")
                        .innerText;

                if (
                    localStorage.getItem(
                        soundName + "Favorite"
                    ) === "true"
                ) {
                    button.innerText =
                        "♥ Favorit";
                }
            }
        });

        const search =
            document.getElementById("searchSounds");

        const sounds =
            document.querySelectorAll(
                ".sounds .sound"
            );

        const noResults =
            document.getElementById("noResults");

        if (search) {
            search.addEventListener(
                "input",
                function() {

                    const text =
                        this.value
                            .toLowerCase()
                            .trim();

                    let found = false;

                    sounds.forEach(
                        function(sound) {

                            const name =
                                sound.querySelector(
                                    "h2"
                                ).innerText
                                 .toLowerCase();

                            if (
                                name.includes(text)
                            ) {
                                sound.style.display =
                                    "";

                                found = true;
                            } else {
                                sound.style.display =
                                    "none";
                            }
                        }
                    );

                    if (noResults) {
                        if (
                            text !== "" &&
                            !found
                        ) {
                            noResults.style.display =
                                "block";
                        } else {
                            noResults.style.display =
                                "none";
                        }
                    }
                }
            );
        }

        showFavorites();
    }
);