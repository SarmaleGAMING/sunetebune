const SUPABASE_URL = "https://dpcaafllcfekrqrskvvv.supabase.co";
const SUPABASE_KEY = "sb_publishable_y2h7_dvmWijw7qT8o_WKSg_hWrX006u";

let supabaseClient = null;

// Inițializare Supabase cu protecție la erori
if (typeof supabase !== "undefined") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.warn("Supabase SDK nu s-a încărcat corect.");
}

// Declarare fișiere audio
const audio = new Audio("sunete/usa.mp3");
const clopotel = new Audio("sunete/clopotel.mp3");

function playSound() {
    try {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Eroare redare audio usa:", err));
    } catch (e) {
        console.error("Fișierul audio nu a putut fi accesat:", e);
    }
}

function playClopotel() {
    try {
        clopotel.currentTime = 0;
        clopotel.play().catch(err => console.error("Eroare redare audio clopotel:", err));
    } catch (e) {
        console.error("Fișierul audio nu a putut fi accesat:", e);
    }
}

function toggleFavorite(button) {
    if (!button) return;
    const sound = button.closest(".sound");
    if (!sound) return;

    const titleElem = sound.querySelector("h2");
    if (!titleElem) return;

    const soundName = titleElem.innerText;
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
    if (!favorites) return;

    favorites.innerHTML = "";

    const sounds = document.querySelectorAll(".sounds > .sound");
    let found = false;

    sounds.forEach(function(sound) {
        const titleElem = sound.querySelector("h2");
        if (!titleElem) return;

        const name = titleElem.innerText;

        if (localStorage.getItem(name + "Favorite") === "true") {
            const copy = sound.cloneNode(true);

            const volumeControl = copy.querySelector(".volume-control");
            if (volumeControl) volumeControl.remove();

            const favoriteButton = copy.querySelector('button[onclick*="toggleFavorite"]');
            if (favoriteButton) favoriteButton.remove();

            favorites.appendChild(copy);
            found = true;
        }
    });

    if (!found) {
        favorites.innerHTML = "<p>Niciun sunet favorit încă.</p>";
    }
}

function toggleFavoriteSection() {
    const section = document.getElementById("favoriteSection");
    const button = document.getElementById("favoriteToggle");

    if (!section || !button) return;

    if (section.style.display === "none" || getComputedStyle(section).display === "none") {
        section.style.display = "block";
        button.innerText = "♡ Ascunde favorite";
    } else {
        section.style.display = "none";
        button.innerText = "♡ Vezi favorite";
    }
}

async function playRandomSound() {
    const sounds = document.querySelectorAll(".sounds .sound");
    if (sounds.length === 0) return;

    const randomIndex = Math.floor(Math.random() * sounds.length);
    const randomSound = sounds[randomIndex];

    const titleElem = randomSound.querySelector("h2");
    if (!titleElem) return;

    const soundName = titleElem.innerText;
    const result = document.getElementById("randomResult");

    if (result) {
        result.textContent = "Ai nimerit: " + soundName;
    }

    const playButton = randomSound.querySelector('button[onclick^="play"]');
    if (playButton) {
        playButton.click();
    }

    if (!supabaseClient) return;

    try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();

        if (userError || !userData?.user) {
            console.log("Nu există utilizator conectat pentru înregistrarea spin-ului.");
            return;
        }

        const userId = userData.user.id;

        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("spins")
            .eq("id", userId)
            .single();

        if (profileError) return;

        const currentSpins = Number(profile.spins) || 0;

        await supabaseClient
            .from("profiles")
            .update({ spins: currentSpins + 1 })
            .eq("id", userId);
            
    } catch (err) {
        console.error("Eroare la actualizarea profilului:", err);
    }
}

async function signUp() {
    const emailElem = document.getElementById("email");
    const usernameElem = document.getElementById("username");
    const passwordElem = document.getElementById("password");
    const message = document.getElementById("authMessage");

    if (!emailElem || !usernameElem || !passwordElem || !message) return;

    const email = emailElem.value.trim();
    const username = usernameElem.value.trim();
    const password = passwordElem.value;

    if (!email || !username || !password) {
        message.textContent = "Completează toate câmpurile.";
        return;
    }

    if (!supabaseClient) {
        message.textContent = "Serviciul de autentificare este indisponibil.";
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo: "https://sarmalegaming.github.io/sunetebune/"
        }
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    if (data.user) {
        const { error: profileError } = await supabaseClient
            .from("profiles")
            .insert({
                id: data.user.id,
                username: username,
                spins: 0
            });

        if (profileError) {
            message.textContent = "Cont creat, dar profilul nu a putut fi salvat.";
            return;
        }
    }

    message.textContent = "Cont creat. Verifică emailul.";
}

async function signIn() {
    const emailElem = document.getElementById("email");
    const passwordElem = document.getElementById("password");
    const message = document.getElementById("authMessage");

    if (!emailElem || !passwordElem || !message) return;

    const email = emailElem.value.trim();
    const password = passwordElem.value;

    if (!email || !password) {
        message.textContent = "Completează emailul și parola.";
        return;
    }

    if (!supabaseClient) {
        message.textContent = "Serviciul de autentificare este indisponibil.";
        return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent = "Te-ai conectat.";
}

window.addEventListener("DOMContentLoaded", function() {
    // Control Volum Ușă
    const usaSlider = document.getElementById("usaSlider");
    const usaVolume = document.getElementById("usaVolume");

    if (usaSlider && usaVolume) {
        usaSlider.addEventListener("input", function() {
            audio.volume = this.value / 100;
            usaVolume.textContent = this.value + "%";
        });
    }

    // Control Volum Clopoțel
    const clopotelSlider = document.getElementById("clopotelSlider");
    const clopotelVolume = document.getElementById("clopotelVolume");

    if (clopotelSlider && clopotelVolume) {
        clopotelSlider.addEventListener("input", function() {
            clopotel.volume = this.value / 100;
            clopotelVolume.textContent = this.value + "%";
        });
    }

    // Marcare Favorite
    const buttons = document.querySelectorAll(".sounds > .sound button");
    buttons.forEach(function(button) {
        if (button.innerText.trim() === "♡ Favorite") {
            const parent = button.parentElement;
            const titleElem = parent ? parent.querySelector("h2") : null;
            if (titleElem) {
                const soundName = titleElem.innerText;
                if (localStorage.getItem(soundName + "Favorite") === "true") {
                    button.innerText = "♥ Favorit";
                }
            }
        }
    });

    // Căutare Sunete
    const search = document.getElementById("searchSounds");
    const sounds = document.querySelectorAll(".sounds .sound");
    const noResults = document.getElementById("noResults");

    if (search) {
        search.addEventListener("input", function() {
            const text = this.value.toLowerCase().trim();
            let found = false;

            sounds.forEach(function(sound) {
                const titleElem = sound.querySelector("h2");
                if (titleElem) {
                    const name = titleElem.innerText.toLowerCase();
                    if (name.includes(text)) {
                        sound.style.display = "";
                        found = true;
                    } else {
                        sound.style.display = "none";
                    }
                }
            });

            if (noResults) {
                noResults.style.display = (text !== "" && !found) ? "block" : "none";
            }
        });
    }

    showFavorites();
});